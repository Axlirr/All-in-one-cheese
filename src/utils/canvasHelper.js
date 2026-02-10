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
 * @param {string} [packageName='canvas'] - Package to check: 'canvacord', 'dig', or 'canvas' (default checks for any available canvas package)
 * @returns {boolean} Returns true if canvas unavailable (error shown), false if available
 */
function checkCanvasAvailable(client, interaction, packageName = 'canvas') {
    const packages = {
        'canvacord': Canvacord,
        'dig': DIG,
        'canvas': Canvas || Canvacord || DIG
    };
    
    const pkg = packages[packageName];
    
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
