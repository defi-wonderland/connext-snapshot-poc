import { Contract, providers, utils, Wallet } from 'ethers';

import { DOMAINS, NetworkProviders, SPOKES } from './snapshot-utils';

export async function snapshot_dispatchSpokes() {
  console.log('/////////////////////////////////////////////////////////');
  console.log('////////////// Start snapshot dispatch spokes //////////');
  console.log('///////////////////////////////////////////////////////\n');

  const networkProviders: NetworkProviders = {
    goerli: new providers.AlchemyProvider(5, process.env.ALCHEMY_GOERLI_KEY),
    'optimism-goerli': new providers.AlchemyProvider(420, process.env.ALCHEMY_OPTIMISM_GOERLI_KEY),
    mumbai: new providers.AlchemyProvider(80001, process.env.ALCHEMY_POLYGON_MUMBAI_KEY)
  };

  try {
    await Promise.all(
      DOMAINS.map(async (domain) => {
        const randomRoot = utils.keccak256(utils.toUtf8Bytes(`example${Math.random() * 10000}`));
        console.log(randomRoot);

        const SPOKE = SPOKES[domain];
        const provider = networkProviders[domain];

        const signer = new Wallet(process.env.TESTNET_DEPLOYER_PK, provider);
        const SpokeConnectorContract = new Contract(SPOKE.address, SPOKE.abi, signer);

        await SpokeConnectorContract.dispatch(randomRoot);
        console.log(`Dispatched to SPOKE (${domain})`);
      })
    );

    console.log(`Successfully dispatched to ${DOMAINS.length} domains ${DOMAINS}`);
  } catch (error) {
    console.error(error);
  }
}
