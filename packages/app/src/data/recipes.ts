import Recipe from "@/model/recipe";

const recipes: Recipe[] = [
    {
        id: 0,
        brewer: "Homebrew Earl",
        description: "A model beer with a big impact. You'll want to drink the whole batch, but don't!",
        batchSize: 5,
        boilTime: 60,
        name: "Odin's Girdle",
        type: "ipa",
        batchNumber: 0,
        efficiency: 75,
        notes: "",
        grain: [{
            name: "2-row",
            weight: 16
        }],
        mash: [{
            weight: 16,
            temp: 185,
            time: 60
        }],
        hops: [{
            name: "cascade",
            weight: 1,
            alpha: 0.76,
            boil: 15
        }],
        yeast: [{
            name: "wyeast 1012",
            avg_attn: 70,
            temp: "62",
            starter: true
        }],
        water: [{
            name: "ph",
            level: "0"
        }],
        targets: {
            og: 0,
            fg: 0,
            abv: 0.0,
            ibu: 0,
            srm: 30
        },
        cost: {
            grains: 0,
            hops: 0,
            yeast: 0,
            other: 0
        }
    }
]

export default recipes;