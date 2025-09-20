// Reference the example args file: https://github.com/scaffold-eth/create-eth-extensions/blob/example/extension/packages/nextjs/components/Header.tsx.args.mjs
// Reference the template file that will use this file: https://github.com/scaffold-eth/create-eth/blob/main/templates/base/packages/nextjs/components/Header.tsx.template.mjs

// Default args:
export const preContent = `import { ShieldCheckIcon } from "@heroicons/react/24/outline";`;
export const extraMenuLinksObjects = [
  {
    label: "Zk Prove & Verify",
    href: "/zk",
    icon: <ShieldCheckIcon className="h-4 w-4" />,
  },
];
export const logoTitle = "Scaffold-ETH";
export const logoSubtitle = "Ethereum dev stack";
