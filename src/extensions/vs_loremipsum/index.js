const BlockType = require('../../extension-support/block-type')
const ArgumentType = require('../../extension-support/argument-type')
const Cast = require('../../util/cast')

const MAX_ITEMS = 10000

const WORDS = [
    "a", "ac", "accumsan", "ad", "adipiscing", "aenean", "aenean", "aliquam", "aliquam", "aliquet",
    "amet", "ante", "aptent", "arcu", "at", "auctor", "augue", "bibendum", "blandit", "class",
    "commodo", "condimentum", "congue", "consectetur", "consequat", "conubia", "convallis", "cras",
    "cubilia", "curabitur", "curabitur", "curae", "cursus", "dapibus", "diam", "dictum", "dictumst",
    "dolor", "donec", "donec", "dui", "duis", "egestas", "eget", "eleifend", "elementum", "elit",
    "enim", "erat", "eros", "est", "et", "etiam", "etiam", "eu", "euismod", "facilisis", "fames",
    "faucibus", "felis", "fermentum", "feugiat", "fringilla", "fusce", "gravida", "habitant",
    "habitasse", "hac", "hendrerit", "himenaeos", "iaculis", "id", "imperdiet", "in", "inceptos",
    "integer", "interdum", "ipsum", "justo", "lacinia", "lacus", "laoreet", "lectus", "leo",
    "libero", "ligula", "litora", "lobortis", "lorem", "luctus", "maecenas", "magna", "malesuada",
    "massa", "mattis", "mauris", "metus", "mi", "molestie", "mollis", "morbi", "nam", "nec",
    "neque", "netus", "nibh", "nisi", "nisl", "non", "nostra", "nulla", "nullam", "nunc", "odio",
    "orci", "ornare", "pellentesque", "per", "pharetra", "phasellus", "placerat", "platea", "porta",
    "porttitor", "posuere", "potenti", "praesent", "pretium", "primis", "proin", "pulvinar",
    "purus", "quam", "quis", "quisque", "quisque", "rhoncus", "risus", "rutrum", "sagittis",
    "sapien", "scelerisque", "sed", "sem", "semper", "senectus", "sit", "sociosqu", "sodales",
    "sollicitudin", "suscipit", "suspendisse", "taciti", "tellus", "tempor", "tempus", "tincidunt",
    "torquent", "tortor", "tristique", "turpis", "ullamcorper", "ultrices", "ultricies", "urna",
    "ut", "ut", "varius", "vehicula", "vel", "velit", "venenatis", "vestibulum", "vitae",
    "vivamus", "viverra", "volutpat", "vulputate"
]

const CLASSIC_START = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit"]

class Generator {
    static clampCount(value) {
        const n = Math.floor(Cast.toNumber(value))
        if (!isFinite(n) || n < 0) return 0
        return Math.min(n, MAX_ITEMS)
    }

    static rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    static pick() {
        return WORDS[Generator.rand(0, WORDS.length - 1)]
    }

    static capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1)
    }

    static words(count, classic) {
        const out = []
        if (classic) {
            for (let i = 0; i < count && i < CLASSIC_START.length; i++) {
                out.push(CLASSIC_START[i])
            }
        }
        while (out.length < count) out.push(Generator.pick())
        return out
    }

    static sentence(classic) {
        const length = classic ? Generator.rand(8, 14) : Generator.rand(6, 14)
        const words = Generator.words(length, classic)

        if (length >= 8) {
            const commas = Generator.rand(0, 2)
            for (let c = 0; c < commas; c++) {
                const pos = Generator.rand(2, length - 3)
                if (!words[pos].endsWith(",")) words[pos] += ","
            }
        }
        return Generator.capitalize(words.join(" ")) + "."
    }

    static paragraph(classic) {
        const count = Generator.rand(3, 6)
        const sentences = []
        for (let i = 0; i < count; i++) {
            sentences.push(Generator.sentence(classic && i === 0))
        }
        return sentences.join(" ")
    }
}

class Extension {
    getInfo() {
        return {
            id: "loremIpsum",
            name: "Lorem Ipsum",
            color1: "#6c5ce7",
            color2: "#5849c9",
            color3: "#4a3db3",
            blocks: [
                {
                    opcode: 'randomWord',
                    text: 'random word',
                    blockType: BlockType.REPORTER
                },
                '---',
                {
                    opcode: 'words',
                    text: '[COUNT] words of lorem ipsum [START]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        COUNT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        },
                        START: {
                            type: ArgumentType.STRING,
                            menu: 'startMenu',
                            defaultValue: 'classic'
                        }
                    }
                },
                {
                    opcode: 'sentences',
                    text: '[COUNT] sentences of lorem ipsum [START]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        COUNT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3
                        },
                        START: {
                            type: ArgumentType.STRING,
                            menu: 'startMenu',
                            defaultValue: 'classic'
                        }
                    }
                },
                {
                    opcode: 'paragraphs',
                    text: '[COUNT] paragraphs of lorem ipsum [START]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        COUNT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                        START: {
                            type: ArgumentType.STRING,
                            menu: 'startMenu',
                            defaultValue: 'classic'
                        }
                    }
                },
                '---',
                {
                    opcode: 'wordCount',
                    text: 'available word count',
                    blockType: BlockType.REPORTER
                }
            ],
            menus: {
                startMenu: {
                    acceptReporters: false,
                    items: [
                        { text: "starting with 'Lorem ipsum'", value: 'classic' },
                        { text: 'fully random', value: 'random' }
                    ]
                }
            }
        }
    }

    randomWord() {
        return Generator.pick()
    }

    words({ COUNT, START }) {
        const count = Generator.clampCount(COUNT)
        if (count === 0) return ''
        return Generator.words(count, START === 'classic').join(' ')
    }

    sentences({ COUNT, START }) {
        const count = Generator.clampCount(COUNT)
        const classic = START === 'classic'
        const out = []
        for (let i = 0; i < count; i++) {
            out.push(Generator.sentence(classic && i === 0))
        }
        return out.join(' ')
    }

    paragraphs({ COUNT, START }) {
        const count = Generator.clampCount(COUNT)
        const classic = START === 'classic'
        const out = []
        for (let i = 0; i < count; i++) {
            out.push(Generator.paragraph(classic && i === 0))
        }
        return out.join('\n\n')
    }

    wordCount() {
        return WORDS.length
    }
}

module.exports = Extension