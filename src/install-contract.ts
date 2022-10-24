import { config } from 'dotenv';
import path from 'path';

import {
  CEP78Client,
  MetadataMutability,
  NFTIdentifierMode,
  NFTKind,
  NFTMetadataKind,
  NFTOwnershipMode,
} from './cep78-client';
import {
  getAccountInfo,
  getAccountNamedKeyValue,
  getBinary,
  getDeploy,
  KEYS,
} from './common';

config();

const install = async () => {
  const cc = new CEP78Client(process.env.NODE_URL!, process.env.NETWORK_NAME!);

  const wasmPath = path.resolve(__dirname, './assets/cep78-contract.wasm');

  const installDeploy = cc.install(
    getBinary(wasmPath),
    {
      collectionName: 'KUNFT',
      collectionSymbol: 'AMAG-ASSETS',
      totalTokenSupply: '8000',
      ownershipMode: NFTOwnershipMode.Minter,
      nftKind: NFTKind.Digital,
      nftMetadataKind: NFTMetadataKind.CEP78,
      identifierMode: NFTIdentifierMode.Ordinal,
      metadataMutability: MetadataMutability.Immutable,
      jsonSchema: {
        properties: {
          name: {
            name: 'name',
            description: 'The name of the NFT',
            required: true,
          },
          token_uri: {
            name: 'token_uri',
            description: 'The URI pointing to an off chain resource',
            required: true,
          },
          checksum: {
            name: 'checksum',
            description: 'A SHA256 hash of the content at the token_uri',
            required: true,
          },
        },
      },
    },
    '165000000000',
    KEYS.publicKey,
    [KEYS],
  );

  const hash = await installDeploy.send(process.env.NODE_URL!);

  console.log(`... Contract installation deployHash: ${hash}`);

  await getDeploy(process.env.NODE_URL!, hash);

  console.log(`... Contract installed successfully.`);

  const accountInfo = await getAccountInfo(
    process.env.NODE_URL!,
    KEYS.publicKey,
  );

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
};

install();
