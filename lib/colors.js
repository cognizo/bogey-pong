var _ = require('underscore');
var Phaser = require('phaser-unofficial');

module.exports = {
    themes: {
        'Bogey': {
            background: '#232c31',
            paddle: '#eeeeee',
            blendMode: Phaser.blendModes.ADD,
            glowIntensity: 1,
            green: '#32cd32',
            yellow: '#daa520',
            red: '#dc143c',
            colors: [
                '#ffffff',
                '#ffa500',
                '#faebd7',
                '#00ffff',
                '#ff7f50',
                '#ffc0cb',
                '#faa520',
                '#f0e68c',
                '#778899',
                '#3cb371',
                '#808000'
            ]
        },
        'Solarized Dark': {
            background: '#002b36',
            paddle: '#fdf6e3',
            blendMode: Phaser.blendModes.ADD,
            glowIntensity: 1,
            green: '#859900',
            yellow: '#b58900',
            red: '#dc322f',
            colors: [
                '#839496',
                '#93a1a1',
                '#eee8d5',
                '#fdf6e3',
                '#b58900',
                '#cb4b16',
                '#dc322f',
                '#d33682',
                '#6c71c4',
                '#268bd2',
                '#2aa198',
                '#859900'
            ]
        },
        'Solarized Light': {
            background: '#fdf6e3',
            paddle: '#002b36',
            blendMode: Phaser.blendModes.NORMAL,
            glowIntensity: 0.5,
            green: '#859900',
            yellow: '#b58900',
            red: '#dc322f',
            colors: [
                '#002b36',
                '#073642',
                '#586e75',
                '#657b83',
                '#839496',
                '#93a1a1',
                '#b58900',
                '#cb4b16',
                '#dc322f',
                '#d33682',
                '#6c71c4',
                '#268bd2',
                '#2aa198',
                '#859900'
            ]
        },
        'Tomorrow Night': {
            background: '#1d1f21',
            paddle: '#c5c8c6',
            blendMode: Phaser.blendModes.ADD,
            glowIntensity: 1,
            green: '#b5bd68',
            yellow: '#f0c674',
            red: '#cc6666',
            colors: [
                '#c5c8c6',
                '#969896',
                '#cc6666',
                '#de935f',
                '#f0c674',
                '#b5bd68',
                '#8abeb7',
                '#81a2be',
                '#b294bb'
            ]
        },
        'Tomorrow Night Eighties': {
            background: '#2d2d2d',
            paddle: '#cccccc',
            blendMode: Phaser.blendModes.ADD,
            glowIntensity: 1,
            green: '#99cc99',
            yellow: '#ffcc66',
            red: '#f2777a',
            colors: [
                '#cccccc',
                '#999999',
                '#f2777a',
                '#f99157',
                '#ffcc66',
                '#99cc99',
                '#66cccc',
                '#6699cc',
                '#cc99cc'
            ]
        },
        'Tomorrow Night Blue': {
            background: '#002451',
            paddle: '#ffffff',
            blendMode: Phaser.blendModes.ADD,
            glowIntensity: 1,
            green: '#d1f1a9',
            yellow: '#ffeead',
            red: '#ff9da4',
            colors: [
                '#ffffff',
                '#7285b7',
                '#ff9da4',
                '#ffc58f',
                '#ffeead',
                '#d1f1a9',
                '#99ffff',
                '#bbdaff',
                '#ebbbff'
            ]
        },
        'Tomorrow': {
            background: '#ffffff',
            paddle: '#4d4d4c',
            blendMode: Phaser.blendModes.NORMAL,
            glowIntensity: 0.4,
            green: '#718c00',
            yellow: '#eab700',
            red: '#c82829',
            colors: [
                '#4d4d4c',
                '#8e908c',
                '#c82829',
                '#f5871f',
                '#eab700',
                '#718c00',
                '#3e999f',
                '#4271ae',
                '#8959a8'
            ]
        },
        'Monokai': {
            background: '#272822',
            paddle: '#f9f8f5',
            blendMode: Phaser.blendModes.ADD,
            glowIntensity: 1,
            green: '#a6e22e',
            yellow: '#fdf5a9',
            red: '#f92672',
            colors: [
                '#ffffff',
                '#FF3D73',
                '#66d9ef',
                '#a6e22e',
                '#fd971f',
                '#fdf5a9',
                '#f9f5c2',
                '#fe7259'
            ]
        },
        'Base16 Dark': {
            background: '#151515',
            paddle: '#f5f5f5',
            blendMode: Phaser.blendModes.ADD,
            glowIntensity: 1,
            green: '#90a959',
            yellow: '#f4bf75',
            red: '#ac4142',
            colors: [
                '#f5f5f5',
                '#e0e0e0',
                '#d0d0d0',
                '#ac4142',
                '#d28445',
                '#f4bf75',
                '#90a959',
                '#75b5aa',
                '#6a9fb5',
                '#aa759f',
                '#8f5546'
            ]
        },
        'Base16 Light': {
            background: '#f5f5f5',
            paddle: '#151515',
            blendMode: Phaser.blendModes.NORMAL,
            glowIntensity: 0.4,
            green: '#90a959',
            yellow: '#f4bf75',
            red: '#ac4142',
            colors: [
                '#202020',
                '#ac4142',
                '#303030',
                '#d28445',
                '#f4bf75',
                '#90a959',
                '#75b5aa',
                '#6a9fb5',
                '#aa759f',
                '#8f5546'
            ]
        },
        'Greenscreen': {
            background: '#001100',
            paddle: '#00ff00',
            blendMode: Phaser.blendModes.ADD,
            glowIntensity: 1,
            green: '#00dd00',
            yellow: '#00bb00',
            red: '#009900',
            colors: [
                '#007700',
                '#009900',
                '#00bb00',
                '#005500',
                '#00dd00',
                '#00ff00'
            ]
        }
    },

    randomColorIndex: function (game, theme) {
        return game.rnd.integerInRange(0, this.themes[theme].colors.length - 1);
    },

    getColor: function (game, theme, index, int) {
        if (index > this.themes[theme].colors.length - 1) {
            index = 0;
        }

        if (int) {
            return this.hexStringToInt(this.themes[theme].colors[index]);
        }

        return this.themes[theme].colors[index];
    },

    hexStringToInt: function (hexString) {
        return parseInt(hexString.slice(1), 16);
    }
};
