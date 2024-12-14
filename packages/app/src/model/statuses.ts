
enum Statuses {
    PREP,
    MASH,
    BOIL,
    FERMENT,
    SECONDARY,
    TERTIARY,
    COMPLETE
}

export const statuses = {
    [Statuses.PREP]: "prep",
    [Statuses.MASH]: "mash",
    [Statuses.BOIL]: "boil",
    [Statuses.FERMENT]: "ferment",
    [Statuses.SECONDARY]: "secondary",
    [Statuses.TERTIARY]: "tertiary",
    [Statuses.COMPLETE]: "complete"
}

export default Statuses;