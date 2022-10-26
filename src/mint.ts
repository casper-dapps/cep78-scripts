import { CLPublicKey, CLValueBuilder } from 'casper-js-sdk';

import { CEP78Client, MintingHelperClient, MintMultipleArgs } from './clients';
import { getDeploy, KEYS, printHeader } from './common';

const { NODE_URL } = process.env;

const mint = async () => {
  const cc = new CEP78Client(process.env.NODE_URL!, process.env.NETWORK_NAME!);

  const contractHash = `hash-fcb8a65ef6aff5be0878161f8d58b852f9b874bb1b25bdd7ed19f5e918554f35`;
  console.log(`... Contract Hash: ${contractHash}`);

  cc.setContractHash(contractHash, undefined, true);

  printHeader('Mint');
  let i = 0;
  const owner = CLPublicKey.fromHex(
    '0183aaf23c198c7209d37b29170055c4fb8a2b4b4f20a71d91b85453f4017d65ee',
  );
  for (i = 28; i < 3000; i++) {
    try {
      console.log(`----Minting ${i} -----`);
      const tokenUri = `https://kunft-assets.s3.amazonaws.com/1.Human+Male/metadata/${i}.json`;
      const fetchedMetadata = await (await fetch(tokenUri)).json();

      const { createHash } = await import('node:crypto');
      const hash = createHash('sha256');

      const checksum = hash
        .update(JSON.stringify(fetchedMetadata, null, 2))
        .digest('hex');

      const mintDeploy = await cc.mint(
        owner,
        {
          name: fetchedMetadata.name,
          token_uri: tokenUri,
          checksum,
        },
        '900000000',
        KEYS.publicKey,
        [KEYS],
      );

      const mintDeployHash = await mintDeploy.send(NODE_URL!);

      console.log('...... Deploy hash: ', mintDeployHash);

      await getDeploy(NODE_URL!, mintDeployHash);

      console.log(`----${i} token Minted Successfully-----`);
    } catch (error: any) {
      console.log(`----Error----- tokenId:${i}`);
      console.error(error);
      console.log(`-------`);
    }
  }
};

const mintByHelper = async () => {
  const client = new MintingHelperClient(
    process.env.NODE_URL!,
    process.env.NETWORK_NAME!,
  );
  client.setContractHash(
    `hash-0aabdc3f37bdc9521602dd5927bda80b568c695f6422866727c840d682799e4a`,
  );

  const tokenOwner = CLPublicKey.fromHex(
    '0183aaf23c198c7209d37b29170055c4fb8a2b4b4f20a71d91b85453f4017d65ee',
  );
  const tokensToMint: MintMultipleArgs['tokens'] = [];
  for (let i = 0; i < 3; i++) {
    const tokenUri = `https://kunft-assets.s3.amazonaws.com/1.Human+Male/metadata/${i}.json`;
    const fetchedMetadata = await (await fetch(tokenUri)).json();

    const { createHash } = await import('node:crypto');
    const hash = createHash('sha256');

    const checksum = hash
      .update(JSON.stringify(fetchedMetadata, null, 2))
      .digest('hex');
    tokensToMint.push({
      tokenOwner,
      tokenMeta: {
        name: fetchedMetadata.name,
        token_uri: tokenUri,
        checksum,
      },
    });
  }

  const tokens = CLValueBuilder.list(
    tokensToMint.map((token) =>
      CLValueBuilder.tuple2([
        CLValueBuilder.key(token.tokenOwner),
        CLValueBuilder.string(JSON.stringify(token.tokenMeta)),
      ]),
    ),
  );

  const deploy = client.mintMultiple(
    {
      contractHash:
        'contract-75c0f650870b733ef498378b72d4fb6dc6b634f7a91aa6cdaf59e4352ef309ea',
      tokens: tokensToMint,
    },
    '20000000000',
    KEYS.publicKey,
    [KEYS],
  );

  const deployHash = await deploy.send(process.env.NODE_URL!);
  console.log('...... Deploy hash: ', deployHash);

  await getDeploy(NODE_URL!, deployHash);

  console.log(`----Token Minted Successfully-----`);
};

// mint();
mintByHelper();
