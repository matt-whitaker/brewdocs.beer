/**
 * Enforces the root CLAUDE.md "Code style" policy: principle comments live at the
 * top level; line narration is banned.
 *
 * A comment survives if any of these hold:
 * - It sits at module top level - a file header, or a block attached to any
 *   top-level statement (not inside a body, object literal, or JSX). That is the
 *   seat for a summary of something complex. Whether a file NEEDS one is
 *   judgment, not lint.
 * - It is a JSDoc block on a member of an exported interface / type-literal /
 *   class / enum body - the public-API carve-out (prop docs feed docgen).
 * - It is a lint-functional directive: eslint-disable/enable/env, inline eslint
 *   config, global(s), exported, the @ts-* pragmas, triple-slash references.
 *   Shebangs are skipped outright.
 *
 * Everything else - a comment inside a function body, a per-line aside, an
 * explainer on an expression - errors: say it in the code, or move the why to a
 * CLAUDE.md.
 *
 * Wired as the `brewdocs` plugin in eslint.config.base.js at "error", inherited
 * by every workspace with no per-package opt-out.
 */
const DIRECTIVE = /^(eslint-disable|eslint-enable|eslint-env|eslint\s|global\s|globals\s|exported\s|@ts-expect-error|@ts-ignore|@ts-nocheck|@ts-check|\/\s*<(reference|amd))/;

const isJsdoc = (comment) => comment.type === "Block" && comment.value.startsWith("*");

const isDirective = (comment) => DIRECTIVE.test(comment.value.trim());

const declaredNames = (statement) => {
    if (statement.type === "VariableDeclaration") {
        return statement.declarations
            .map((declaration) => declaration.id && declaration.id.name)
            .filter(Boolean);
    }
    return statement.id && statement.id.name ? [statement.id.name] : [];
};

const membersOf = (declaration) => {
    if (!declaration) return [];
    if (declaration.type === "TSInterfaceDeclaration") return declaration.body.body;
    if (declaration.type === "TSTypeAliasDeclaration" && declaration.typeAnnotation.type === "TSTypeLiteral") {
        return declaration.typeAnnotation.members;
    }
    if (declaration.type === "ClassDeclaration") return declaration.body.body;
    if (declaration.type === "TSEnumDeclaration") {
        return (declaration.body && declaration.body.members) || declaration.members || [];
    }
    return [];
};

export default {
    meta: {
        type: "suggestion",
        docs: {
            description: "principle comments at top level survive; line narration inside bodies errors"
        },
        schema: [],
        messages: {
            superfluous: "Line narration is banned - say it in the code, hoist a principle comment to the top level, or move the why to a CLAUDE.md. See root CLAUDE.md, Code style."
        }
    },
    create(context) {
        const sourceCode = context.sourceCode;
        return {
            Program(program) {
                const statementRanges = program.body.map((statement) => statement.range);
                const insideAStatement = (comment) =>
                    statementRanges.some(([start, end]) => comment.range[0] > start && comment.range[1] < end);

                const exportedNames = new Set();
                for (const statement of program.body) {
                    if (statement.type === "ExportNamedDeclaration" && !statement.source) {
                        for (const specifier of statement.specifiers) {
                            exportedNames.add(specifier.local.name);
                        }
                    }
                }

                const allowedMemberDocs = new Set();
                for (const statement of program.body) {
                    let exportedDeclaration = null;
                    if (statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration") {
                        exportedDeclaration = statement.declaration;
                    } else if (declaredNames(statement).some((name) => exportedNames.has(name))) {
                        exportedDeclaration = statement.type === "VariableDeclaration" ? null : statement;
                    }
                    for (const member of membersOf(exportedDeclaration)) {
                        for (const comment of sourceCode.getCommentsBefore(member)) {
                            if (isJsdoc(comment)) allowedMemberDocs.add(comment);
                        }
                    }
                }

                for (const comment of sourceCode.getAllComments()) {
                    if (comment.type === "Shebang") continue;
                    if (isDirective(comment)) continue;
                    if (!insideAStatement(comment)) continue;
                    if (allowedMemberDocs.has(comment)) continue;
                    context.report({ loc: comment.loc, messageId: "superfluous" });
                }
            }
        };
    }
};
