import { employerSchema, personSchema, serviceSchema, websiteSchema } from "@/lib/schema";

/** Renders one JSON-LD block. `graph` items can reference each other by @id. */
export function JsonLd({ graph }: { graph: object[] }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
            }}
        />
    );
}

/** Site-wide entities, emitted on every page from the root layout. */
export function StructuredData() {
    return (
        <JsonLd
            graph={[personSchema(), employerSchema(), websiteSchema(), serviceSchema()]}
        />
    );
}
