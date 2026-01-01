
export default {
    providers: [
        {
            domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://open-toad-23.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};
