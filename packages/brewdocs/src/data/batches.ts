import {Batch} from "@brewdocs/model/batch";

const batches: Batch[] = [
    {
        id: 0,
        grain: [{
            name: "2-row",
            weight: 16
        }],

        mash: [{
            name: "main",
            weight: 16,
            temp: 170,
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

        actuals: {
            og: 0,
            fg: 0,
            abv: 0.0,
            ibu: 0,
            srm: 30
        }
    }
];

export default batches;