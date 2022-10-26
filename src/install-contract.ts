import path from 'path';

import {
  CEP78Client,
  MetadataMutability,
  MintingHelperClient,
  NFTHolderMode,
  NFTIdentifierMode,
  NFTKind,
  NFTMetadataKind,
  NFTOwnershipMode,
  WhitelistMode,
} from './clients';
import {
  getAccountInfo,
  getAccountNamedKeyValue,
  getBinary,
  getDeploy,
  KEYS,
} from './common';

const install = async () => {
  console.log(process.env.NODE_URL!, process.env.NETWORK_NAME!);
  const cc = new CEP78Client(process.env.NODE_URL!, process.env.NETWORK_NAME!);

  const wasmPath = path.resolve(__dirname, './assets/cep78-contract.wasm');

  const collectionName = 'KUNFT';

  const installDeploy = cc.install(
    getBinary(wasmPath),
    {
      collectionName,
      collectionSymbol: 'KUNFT',
      totalTokenSupply: '10000',
      ownershipMode: NFTOwnershipMode.Transferable,
      nftKind: NFTKind.Digital,
      nftMetadataKind: NFTMetadataKind.CEP78,
      identifierMode: NFTIdentifierMode.Ordinal,
      metadataMutability: MetadataMutability.Immutable,
      holderMode: NFTHolderMode.Mixed,
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
      whitelistMode: WhitelistMode.Unlocked,
      contractWhitelist: [
        '86f2c717b4f1353763eb63702eb27372fcc1cb3e5148b472d3c5b182f6c35b47',
      ],
    },
    '160000000000',
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

  const contractPackageHash = await getAccountNamedKeyValue(
    accountInfo,
    `${collectionName}_contract_package_hash`,
  );

  console.log(`... Contract Package Hash: ${contractPackageHash}`);
};

const config = async () => {
  const cc = new CEP78Client(process.env.NODE_URL!, process.env.NETWORK_NAME!);
  cc.setContractHash(
    'hash-75c0f650870b733ef498378b72d4fb6dc6b634f7a91aa6cdaf59e4352ef309ea',
  );

  const deploy = cc.setVariables(
    {
      contractWhitelist: [
        '86f2c717b4f1353763eb63702eb27372fcc1cb3e5148b472d3c5b182f6c35b47',
      ],
    },
    '1000000000',
    KEYS.publicKey,
    [KEYS],
  );

  const deployHash = await deploy.send(process.env.NODE_URL!);

  console.log({ deployHash });
  await getDeploy(process.env.NODE_URL!, deployHash);
  console.log(`Installed successfully`);
};

const installHelperContract = async () => {
  const client = new MintingHelperClient(
    process.env.NODE_URL!,
    process.env.NETWORK_NAME!,
  );
  const wasmPath = path.resolve(
    __dirname,
    './assets/cep78-minting-helper.wasm',
  );
  const deploy = client.install(
    getBinary(wasmPath),
    { contractName: 'KUNFT Minting Helper' },
    '80000000000',
    KEYS.publicKey,
    [KEYS],
  );
  const deployHash = await deploy.send(process.env.NODE_URL!);

  console.log({ deployHash });
  await getDeploy(process.env.NODE_URL!, deployHash);
  console.log(`Installed successfully`);
};

// install();
config();

// installHelperContract();
