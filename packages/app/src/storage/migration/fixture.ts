import {Entity} from "@brewdocs.beer/core";
import {Forage} from "@/storage/forage";
import {LF_INDEXEDDB} from "@/storage/localforage";
import {Migration} from "@/storage/migration/types";

export const FIXTURE_ENTITY_TYPE = "migration-fixture";
export const FIXTURE_VERSION = 3;

export const FIXTURE_THROWS_ENTITY_TYPE = "migration-fixture-throws";
export const FIXTURE_THROWS_VERSION = 2;

export const FIXTURE_ORPHAN_ENTITY_TYPE = "migration-fixture-orphan";
export const FIXTURE_ORPHAN_VERSION = 3;

export const FIXTURE_NOTES_SEPARATOR = ", ";

export interface Fixture extends Entity {
    label?: string;
    name?: string;
    notes?: string | string[];
}

const notesAsList = (notes: Fixture["notes"]): string[] =>
    Array.isArray(notes) ? notes : (notes ?? "").split(FIXTURE_NOTES_SEPARATOR).filter(Boolean);

const notesAsText = (notes: Fixture["notes"]): string =>
    Array.isArray(notes) ? notes.join(FIXTURE_NOTES_SEPARATOR) : notes ?? "";

const renameLabelToName = ({label, ...fixture}: Fixture): Fixture => ({...fixture, name: label});
const renameNameToLabel = ({name, ...fixture}: Fixture): Fixture => ({...fixture, label: name});

const splitNotesIntoList = (fixture: Fixture): Fixture => ({...fixture, notes: notesAsList(fixture.notes)});
const joinNotesIntoText = (fixture: Fixture): Fixture => ({...fixture, notes: notesAsText(fixture.notes)});

const throwDeliberateFailure = (): Fixture => {
    throw new Error("fixture: deliberate migration failure");
};

const fixtureMigrations: Migration<Fixture>[] = [
    {entityType: FIXTURE_ENTITY_TYPE, from: 1, to: 2, up: renameLabelToName, down: renameNameToLabel},
    {entityType: FIXTURE_ENTITY_TYPE, from: 2, to: 3, up: splitNotesIntoList, down: joinNotesIntoText},
];

const fixtureThrowsMigrations: Migration<Fixture>[] = [
    {entityType: FIXTURE_THROWS_ENTITY_TYPE, from: 1, to: 2, up: throwDeliberateFailure, down: throwDeliberateFailure},
];

const fixtureOrphanMigrations: Migration<Fixture>[] = [
    {entityType: FIXTURE_ORPHAN_ENTITY_TYPE, from: 2, to: 3, up: splitNotesIntoList, down: joinNotesIntoText},
];

export class FixtureStorage extends Forage<Fixture> {
    constructor() {
        super(FIXTURE_ENTITY_TYPE, LF_INDEXEDDB, {
            entityType: FIXTURE_ENTITY_TYPE,
            version: FIXTURE_VERSION,
            migrations: fixtureMigrations,
        });
    }
}

export class FixtureThrowsStorage extends Forage<Fixture> {
    constructor() {
        super(FIXTURE_THROWS_ENTITY_TYPE, LF_INDEXEDDB, {
            entityType: FIXTURE_THROWS_ENTITY_TYPE,
            version: FIXTURE_THROWS_VERSION,
            migrations: fixtureThrowsMigrations,
        });
    }
}

export class FixtureOrphanStorage extends Forage<Fixture> {
    constructor() {
        super(FIXTURE_ORPHAN_ENTITY_TYPE, LF_INDEXEDDB, {
            entityType: FIXTURE_ORPHAN_ENTITY_TYPE,
            version: FIXTURE_ORPHAN_VERSION,
            migrations: fixtureOrphanMigrations,
        });
    }
}

export const fixtureStorage = new FixtureStorage();
export const fixtureThrowsStorage = new FixtureThrowsStorage();
export const fixtureOrphanStorage = new FixtureOrphanStorage();
