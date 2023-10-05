addLayer("b", {
    name: "berry", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "berries", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.mul(buyableEffect('b', 11))
        // mult = mult.mul(layer['r'].effect())
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    passiveGeneration(){
        mult = new Decimal(0)
        if(hasUpgrade('b', 21)) mult = new Decimal(0.1)
        return mult
    },
    layerShown(){return true},
    buyables: {
        11:{
            title: "Experiences",
            cost(x) {
                return new Decimal(8).pow(x)
            },
            unlocked() {
                return hasUpgrade('b', 13)
            },
            effect(x){
                base = new Decimal(2)
                base = base.add(buyableEffect('b', 12))
                return base.pow(x);
            },
            display() {
                base = new Decimal(2)
                base = base.add(buyableEffect('b', 12))
                return "Multiply the berries gaining by x" + format(base) + ".\ncurrently: x" + format(this.effect())+"\ncost: " + format(this.cost(),0) + " berries."
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy(){
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            }
        },
        12:{
            title: "Skills",
            cost(x) {
                return new Decimal(4).mul(x.add(1))
            },
            unlocked(){
                return hasUpgrade('b',15)
            },
            effect(x){
                return new Decimal(0.2).mul(x)
            },
            display(){
                return "Increase the effect of the first buyable upgrade, and reset your berries.\ncurrently: +" + format(this.effect()) + "\ncost: all your berries and " + format(this.cost(), 0) + " Experiences upgrades"
            },
            canAfford() { return getBuyableAmount('b', 11).gte(this.cost()) },
            buy(){
                player[this.layer].points = new Decimal(0)
                setBuyableAmount('b', 11, getBuyableAmount('b', 11).sub(this.cost()))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            }
        }
    },
    upgrades: {
        11:{
            name: "11",
            description: "Double the points gaining.",
            cost: new Decimal(1)
        },
        12:{
            name: "12",
            description: "Berries effect the points gaining.",
            cost: new Decimal(2),
            effect() {
                exp = new Decimal(0.5)
                if(hasUpgrade('b',14))exp = new Decimal(0.7)
                if(hasUpgrade('b',22))exp = new Decimal(0.8)
                return player[this.layer].points.add(1).pow(exp)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // 给这个 effect 一个格式
        },
        13:{
            name: "13",
            description: "Unlock the first buyable upgrade.",
            cost: new Decimal(10)
        },
        14:{
            name: "14",
            description: "Increase the effect from 12.(^0.5 -> ^0.7)",
            cost: new Decimal(50)
        },
        15:{
            name: "15",
            description: "Unlock the second buyable upgrade.",
            cost: new Decimal(300)
        },
        21:{
            name: "21",
            description: "Disable the reset and gain berries passively.",
            cost: new Decimal(5000)
        },
        22:{
            name: "22",
            description: "Increase the effect from 12.(^0.7 -> ^0.8)",
            cost: new Decimal("5e6")
        },
        23:{
            name: "23",
            description: "Unlock the Room layer.",
            cost: new Decimal("5e7")
        }
    },
    tabFormat:[
        "main-display",
        function(){
            if(hasUpgrade('b', 21)) return "blank"
            return "prestige-button"
        },
        "blank",
        "buyables",
        "blank",
        "upgrades"
    ]
})
addLayer('r',{
    name: "Room", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    previousTab: 'b',
    color: "#E62A6D",
    requires: new Decimal("5e8"), // Can be a function that takes requirement increases into account
    resource: "rooms", // Name of prestige currency
    baseResource: "berries", // Name of resource prestige is based on
    baseAmount() {return player['b'].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    highhistory: new Decimal(0),
    effect(){
        this.highhistory = this.highhistory.max(player[this.layer].points)
        mult = new Decimal(1).add(this.highhistory.pow(0.6).mul(20))
        return mult
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    passiveGeneration(){
        mult = new Decimal(0)
        return mult
    },
    layershowed: false,
    layerShown(){
        this.layershowed = this.layershowed | hasUpgrade('b',23)
        return this.layershowed
    },
    branches: ['b'],
    tabFormat:[
        "main-display",
        "blank",
        "prestige-button",
        "blank",
    ]
})
