const {inlineSvgFonts} = require('scratch-svg-renderer');
const HAS_FONT_REGEXP = 'font-family(?!="none")';

const getCostumeUrl = asset => {
    // If the SVG refers to fonts, they must be inlined in order to display correctly in the img tag.
    // Avoid parsing the SVG when possible, since it's expensive.
    if (asset.assetType.name === 'ImageVector') {
        const svgString = asset.decodeText();
        if (svgString.match(HAS_FONT_REGEXP)) {
            const svgText = inlineSvgFonts(svgString);
            return `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
        }
    }
    return asset.encodeDataURI();
};

module.exports = getCostumeUrl;
