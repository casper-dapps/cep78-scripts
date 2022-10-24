import { CEP78Client } from './cep78-client';
import {
  getAccountInfo,
  getAccountNamedKeyValue,
  getDeploy,
  KEYS,
  printHeader,
} from './common';

const { NODE_URL } = process.env;

const run = async () => {
  const cc = new CEP78Client(process.env.NODE_URL!, process.env.NETWORK_NAME!);

  const accountInfo = await getAccountInfo(NODE_URL!, KEYS.publicKey);

  console.log(`\n=====================================\n`);

  console.log(`... Account Info: `);
  console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = await getAccountNamedKeyValue(
    accountInfo,
    `nft_contract`,
  );

  const contractPackageHash = await getAccountNamedKeyValue(
    accountInfo,
    `nft_contract_package`,
  );

  console.log(`... Contract Hash: ${contractHash}`);
  console.log(`... Contract Package Hash: ${contractPackageHash}`);

  cc.setContractHash(contractHash, undefined, true);

  console.log(`\n=====================================\n`);

  const allowMintingSetting = await cc.getAllowMintingConfig();
  console.log(allowMintingSetting);

  const burnModeSetting = await cc.getBurnModeConfig();
  console.log(burnModeSetting);

  const holderModeSetting = await cc.getHolderModeConfig();
  console.log(holderModeSetting);

  const identifierModeSetting = await cc.getIdentifierModeConfig();
  console.log(identifierModeSetting);

  /* Mint */
  printHeader('Mint');

  const tokenUri =
    'https://kunft-assets.s3.amazonaws.com/1.Human+Male/metadata/0.json';

  const fetchedMetadata = await (await fetch(tokenUri)).json();

  console.log(fetchedMetadata);

  const { createHash } = await import('node:crypto');

  const hash = createHash('sha256');

  const checksum = hash
    .update(JSON.stringify(fetchedMetadata, null, 2))
    .digest('hex');

  const mintDeploy = await cc.mint(
    KEYS.publicKey,
    {
      name: fetchedMetadata.name,
      token_uri: tokenUri,
      checksum,
    },
    '700000000',
    KEYS.publicKey,
    [KEYS],
  );

  const mintDeployHash = await mintDeploy.send(NODE_URL!);

  console.log('...... Deploy hash: ', mintDeployHash);
  console.log('...... Waiting for the deploy...');

  await getDeploy(NODE_URL!, mintDeployHash);

  console.log('Deploy Succedeed');
};

run();
