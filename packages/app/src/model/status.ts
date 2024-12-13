
enum Status {
    PREP,
    MASH,
    BOIL,
    FERMENT,
    SECONDARY,
    TERTIARY,
    COMPLETE
}

export const statuses = {
    [Status.PREP]: "prep",
    [Status.MASH]: "mash",
    [Status.BOIL]: "boil",
    [Status.FERMENT]: "ferment",
    [Status.SECONDARY]: "secondary",
    [Status.TERTIARY]: "tertiary",
    [Status.COMPLETE]: "complete"
}

export default Status;