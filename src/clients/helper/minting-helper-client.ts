import {
  CasperClient,
  CLPublicKey,
  CLStringType,
  CLValueBuilder,
  Contracts,
  Keys,
  RuntimeArgs,
} from 'casper-js-sdk';
import { None, Some } from 'ts-results';

import { InstallArgs, MintMultipleArgs } from './types';

const { Contract } = Contracts;

export * from './types';

export class MintingHelperClient {
  casperClient: CasperClient;
  contractClient: Contracts.Contract;

  constructor(public nodeAddress: string, public networkName: string) {
    this.casperClient = new CasperClient(nodeAddress);
    this.contractClient = new Contract(this.casperClient);
  }

  public install(
    wasm: Uint8Array,
    args: InstallArgs,
    paymentAmount: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[],
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      contract_name: CLValueBuilder.string(args.contractName),
      contract_package_hash: args.contractPackageHash
        ? CLValueBuilder.option(
            Some(CLValueBuilder.string(args.contractPackageHash)),
          )
        : CLValueBuilder.option(None, new CLStringType()),
    });

    return this.contractClient.install(
      wasm,
      runtimeArgs,
      paymentAmount,
      deploySender,
      this.networkName,
      keys,
    );
  }

  public setContractHash(contractHash: string, contractPackageHash?: string) {
    this.contractClient.setContractHash(contractHash, contractPackageHash);
  }

  public mintMultiple(
    args: MintMultipleArgs,
    paymentAmount: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[],
  ) {
    const tokens = CLValueBuilder.list(
      args.tokens.map((token) =>
        CLValueBuilder.tuple2([
          CLValueBuilder.key(token.tokenOwner),
          CLValueBuilder.string(JSON.stringify(token.tokenMeta)),
        ]),
      ),
    );

    const runtimeArgs = RuntimeArgs.fromMap({
      contract_hash: CLValueBuilder.string(args.contractHash),
      tokens,
    });

    return this.contractClient.callEntrypoint(
      'mint_multiple',
      runtimeArgs,
      deploySender,
      this.networkName,
      paymentAmount,
      keys,
    );
  }
}
