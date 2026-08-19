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
            description: "every comment errors except JSDoc on exported API surfaces and lint-functional directives"
        },
        schema: [],
        messages: {
            superfluous: "Say it in the code (a precise name, a smaller function, an explicit type); if a reader still needs the why, it belongs in a CLAUDE.md. See root CLAUDE.md, Code style."
        }
    },
    create(context) {
        const sourceCode = context.sourceCode;
        return {
            Program(program) {
                const exportedNames = new Set();
                for (const statement of program.body) {
                    if (statement.type === "ExportNamedDeclaration" && !statement.source) {
                        for (const specifier of statement.specifiers) {
                            exportedNames.add(specifier.local.name);
                        }
                    }
                }

                const allowed = new Set();
                const allowJsdocBefore = (node) => {
                    for (const comment of sourceCode.getCommentsBefore(node)) {
                        if (isJsdoc(comment)) allowed.add(comment);
                    }
                };

                for (const statement of program.body) {
                    let exportedDeclaration = null;
                    if (statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration") {
                        allowJsdocBefore(statement);
                        exportedDeclaration = statement.declaration;
                    } else if (declaredNames(statement).some((name) => exportedNames.has(name))) {
                        allowJsdocBefore(statement);
                        exportedDeclaration = statement.type === "VariableDeclaration" ? null : statement;
                    }
                    for (const member of membersOf(exportedDeclaration)) {
                        allowJsdocBefore(member);
                    }
                }

                for (const comment of sourceCode.getAllComments()) {
                    if (comment.type === "Shebang") continue;
                    if (isDirective(comment)) continue;
                    if (allowed.has(comment)) continue;
                    context.report({ loc: comment.loc, messageId: "superfluous" });
                }
            }
        };
    }
};
