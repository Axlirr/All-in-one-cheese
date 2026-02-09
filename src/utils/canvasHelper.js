/**
 * Helper utilities for optional canvas dependencies
 */

let Canvacord, Canvas, DIG;

// Try to load canvas-dependent packages
try {
    const canvacordModule = require("canvacord");
    Canvacord = canvacordModule;
    Canvas = canvacordModule.Canvas;
} catch (error) {
    Canvacord = null;
    Canvas = null;
}

try {
    DIG = require("discord-image-generation");
} catch (error) {
    DIG = null;
}

/**
 * Check if canvas packages are available and return error if not
 * @param {Object} client - Discord client
 * @param {Object} interaction - Discord interaction
 * @returns {Object|null} Returns error object if canvas unavailable, null if available
 */
function checkCanvasAvailable(client, interaction, packageName = 'canvas') {
    const pkg = packageName === 'canvacord' ? Canvacord : (packageName === 'dig' ? DIG : (Canvas || Canvacord || DIG));
    
    if (!pkg) {
        client.errNormal({
            error: "This command requires canvas packages that are not available in this environment.",
            type: 'editreply'
        }, interaction);
        return true; // Returns true to indicate error
    }
    return false; // Returns false to indicate no error
}

module.exports = {
    Canvacord,
    Canvas,
    DIG,
    checkCanvasAvailable
};
