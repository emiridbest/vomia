# Vomia

Vomia is a decentralized peer-to-peer exchange built by Africans for Africa and the world. The motivation behind creating Vomia is the growing need for decentralized off-ramping and on-ramping services, especially following issues between Binance and some governments.
## How It Works:

    Order Types: There are two types of orders - Sell and Buy orders.
    Seller Actions: A seller places a sell order.
    Contract Interaction: This triggers the transfer of the corresponding amount of cUSD to the contract address.
    Buyer Actions: A buyer marks the order as active, preventing other potential buyers from accessing it.
    Fiat Transfer: The buyer makes a fiat transfer of the equivalent amount held in the contract escrow to the seller's bank details.
    Completion: The seller then calls the paid function, triggering the transfer of the funds from the contract to the buyer's wallet.

## How It Was Made:

    Smart Contract: The smart contract was written in Solidity, compiled, tested, and deployed on both the Celo mainnet and Alfajores testnet via Remix.
    Frontend: The frontend was bootstrapped with the Celo Composer boilerplate code. Using TypeScript and Tailwind CSS made the development process enjoyable.
    Interaction: Smart contract interaction was facilitated through Wagmi, Viem, and BrowserProvider.

## Challenges:

    Deployment Issues: Initially, Vercel was rejecting the deployment despite successfully running yarn build locally, likely due to a node version discrepancy.
    Lack of Backend: There is no backend yet, especially to store messages.
    UI Design: Choosing the right UI colors was challenging. I joked with a friend that this site is the second most beautiful thing I've ever built, after my mindset.

## To-Do:

    Build the backend as we prepare for the next accelerator phase.

## Roadmap:

    MVP: This is our Minimum Viable Product (MVP).
    Backend Development: Build the backend by September.
    Smart Contract Audit: Conduct a smart contract audit by October.
    Full Launch: Fully launch on Minipay before December.
