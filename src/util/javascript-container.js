const rotationStyleOptions = [
    'left-right',
    'don\'t rotate',
    'all around'
];

class execute {
    constructor (funcText, target, runtime) {
        const thisData = this.getThisFuncs(target, runtime);
        thisData.mySelf = new Function(funcText);
    }
    getThisFuncs (target, runtime) {
        // all of the functions accessed by `this`
        // must have there internal vars defined externaly
        // so that the code can not access nor edit them
        const thisFuncs = {
            goto: target.setXY,
            set xPosition (newPos) {
                target.setXY(newPos, target.y);
            },
            set yPosition (newPos) {
                target.setXY(target.x, newPos);
            },
            get xPosition () {
                return target.x;
            },
            get yPosition () {
                return target.y;
            },
            set direction (newDir) {
                target.setDirection(newDir);
            },
            get direction () {
                return target.direction;
            },
            set rotationStyle (style) {
                if (!rotationStyleOptions.includes(style)) {
                    throw new Error(`invalid style: ${style}`);
                }
                target.setRotationStyle(style);
            }
        };
        return thisFuncs;
    }
}

module.exports = execute;
