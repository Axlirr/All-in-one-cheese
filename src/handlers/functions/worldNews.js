const Parser = require('rss-parser');
const WorldNewsConfig = require('../../database/models/worldNewsConfig');

const parser = new Parser({ timeout: 12000 });

const WORLDMONITOR_FEEDS = {
    world: [
        { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/?best-topics=world&post_type=best' },
        { name: 'AP Top News', url: 'https://feeds.apnews.com/apf-topnews' },
        { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
        { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
        { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss' },
    ],
    tech: [
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
        { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
        { name: 'Hacker News', url: 'https://hnrss.org/frontpage' },
        { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/' },
    ],
    finance: [
        { name: 'CNBC Finance', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
        { name: 'MarketWatch', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories' },
        { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/rss/topstories' },
        { name: 'Financial Times World', url: 'https://www.ft.com/world?format=rss' },
        { name: 'Reuters Business', url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best' },
    ],
    happy: [
        { name: 'Good News Network', url: 'https://www.goodnewsnetwork.org/feed/' },
        { name: 'Positive News', url: 'https://www.positive.news/feed/' },
        { name: 'Humans of New York', url: 'https://www.humansofnewyork.com/rss' },
    ],
};

function compactSeenLinks(links = []) {
    const uniq = [];
    for (const link of links) {
        if (!link || uniq.includes(link)) continue;
        uniq.push(link);
    }
    return uniq.slice(-400);
}

function buildNewsEmbed(client, item, feedName, variant) {
    const title = (item.title || 'Untitled').slice(0, 240);
    const description = (item.contentSnippet || item.summary || item.content || 'No summary available.')
        .replace(/\s+/g, ' ')
        .slice(0, 350);

    const embed = client.templateEmbed()
        .setTitle(`📰 ${title}`)
        .setDescription(description)
        .addFields(
            { name: 'Source', value: feedName || 'Unknown', inline: true },
            { name: 'Category', value: variant, inline: true }
        )
        .setColor(client.config.colors.normal)
        .setTimestamp(new Date(item.isoDate || item.pubDate || Date.now()));

    if (item.link) embed.setURL(item.link);
    if (item.enclosure?.url) embed.setImage(item.enclosure.url);

    return embed;
}

module.exports = async (client) => {
    client.fetchWorldMonitorNews = async function (variant = 'world') {
        const feeds = WORLDMONITOR_FEEDS[variant] || WORLDMONITOR_FEEDS.world;
        const allItems = [];

        for (const feed of feeds) {
            try {
                const parsed = await parser.parseURL(feed.url);
                const items = (parsed.items || []).slice(0, 8).map((it) => ({ ...it, __feedName: feed.name }));
                allItems.push(...items);
            } catch (_) {
                // Ignore single-feed failures to keep service resilient
            }
        }

        return allItems
            .filter((it) => Boolean(it.link) && Boolean(it.title))
            .sort((a, b) => new Date(b.isoDate || b.pubDate || 0) - new Date(a.isoDate || a.pubDate || 0));
    }

    client.runWorldNewsCycle = async function () {
        const configs = await WorldNewsConfig.find({ Enabled: true });
        if (!configs.length) return;

        for (const cfg of configs) {
            const interval = Math.max(5, Number(cfg.IntervalMins) || 15);
            const now = Date.now();
            if (cfg.LastRunAt && (now - cfg.LastRunAt) < interval * 60_000) continue;

            cfg.LastRunAt = now;
            await cfg.save();

            const channel = await client.channels.fetch(cfg.Channel).catch(() => null);
            if (!channel || !channel.isTextBased()) continue;

            const variant = cfg.Variant || 'world';
            const items = await client.fetchWorldMonitorNews(variant);
            if (!items.length) continue;

            const seen = new Set(cfg.SeenLinks || []);
            const fresh = items
                .filter((it) => !seen.has(it.link))
                .slice(0, 3);

            for (const item of fresh) {
                const embed = buildNewsEmbed(client, item, item.__feedName, variant);
                await channel.send({ embeds: [embed] }).catch(() => null);
                cfg.SeenLinks.push(item.link);
                cfg.LastPostedAt = Date.now();
            }

            cfg.SeenLinks = compactSeenLinks(cfg.SeenLinks);
            await cfg.save();
        }
    }
}
