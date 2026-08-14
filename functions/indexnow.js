export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const urls = body.urls;

        if (!Array.isArray(urls) || urls.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "No URLs supplied."
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        if (urls.length > 10000) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Maximum 10,000 URLs per request."
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const host = new URL(context.request.url).hostname;
        const key = context.env.INDEXNOW_KEY;

        if (!key) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "INDEXNOW_KEY environment variable is not configured."
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const payload = {
            host,
            key,
            keyLocation: `https://${host}/${key}.txt`,
            urlList: urls
        };

        const response = await fetch(
            "https://api.indexnow.org/indexnow",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(payload)
            }
        );

        const responseText = await response.text();

        return new Response(
            JSON.stringify({
                success: response.ok,
                indexnow_status: response.status,
                response: responseText || "Submitted"
            }),
            {
                status: response.ok ? 200 : response.status,
                headers: { "Content-Type": "application/json" }
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}
