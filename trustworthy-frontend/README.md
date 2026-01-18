## Current Issues/Technical Debt

1. Currently the backend is fully operating on the built in Next.js full-stack framework, but in future this app may need more powerful capabilities (especially with user data inside a backend for things like subscriptions). I would like to move this local to a separate API, that way we can sell access to this API as well cleanly

## Features for MVP
1. The additional aforementioned sources:

 - ACT Government Disciplinary Register (AGDR)
This source is mostly complete the API route /search has the function ```disciplinaryRegSearch()``` which pipes the data found in the disciplinary register csv for data relating to the acn of the /search acn (currently commented out)

Currently have issues with missing ACNs on many relevant companies but thats a data quality issue with AGDR, also the available csv on the website seems to change its data, so may need some kind of archive system to sporadically download the csv and hold on to old data.

 - ASIC Published Notices (Insolvency)
 - ACT Government Secure Local Jobs Code Certified Entities
 - ASIC Banned and Disqualified Individuals (Search within 'Banned and Disqualified' Individuals')
 - Payment Times Register



## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
