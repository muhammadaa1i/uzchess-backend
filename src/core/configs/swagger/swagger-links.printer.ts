import {SWAGGER_DOC_GROUPS} from "@/core/configs/swagger/swagger-doc-groups";

export function printSwaggerLinks(host: string) {
    const labelWidth = Math.max(
        ...SWAGGER_DOC_GROUPS.map((group) => group.path.split("/")[1].length),
    );

    console.log("\nSwagger docs:");
    for (const group of SWAGGER_DOC_GROUPS) {
        const label = group.path.split("/")[1];
        console.log(`  ${label.padEnd(labelWidth)}  ${host}/${group.path}`);
    }
    console.log();
}
