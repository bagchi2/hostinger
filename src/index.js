export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // IndexNow endpoint
        if (url.pathname === "/indexnow") {
            if (request.method !== "POST") {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "Use POST request."
                    }),
                    {
                        status: 405,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            try {
                const body = await request.json();
                const urls = body.urls;

                if (!Array.isArray(urls) || urls.length === 0) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: "No URLs supplied."
                        }),
                        {
                            status: 400,
                            headers: {
                                "Content-Type": "application/json"
                            }
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
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    );
                }

                const key = env.INDEXNOW_KEY;

                if (!key) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: "INDEXNOW_KEY is not configured."
                        }),
                        {
                            status: 500,
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    );
                }

                const host = url.hostname;

                const payload = {
                    host: host,
                    key: key,
                    keyLocation: `https://${host}/${key}.txt`,
                    urlList: urls
                };

                const indexNowResponse = await fetch(
                    "https://api.indexnow.org/indexnow",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json; charset=utf-8"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                const responseText =
                    await indexNowResponse.text();

                return new Response(
                    JSON.stringify({
                        success: indexNowResponse.ok,
                        indexnow_status: indexNowResponse.status,
                        response:
                            responseText || "Submitted successfully."
                    }),
                    {
                        status: indexNowResponse.ok
                            ? 200
                            : indexNowResponse.status,
                        headers: {
                            "Content-Type": "application/json"
                        }
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
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }
        }

        // Everything else continues to your existing website
        return env.ASSETS.fetch(request);
    }
};