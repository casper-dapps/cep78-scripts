import { CLKeyParameters } from 'casper-js-sdk';

export interface InstallArgs {
  contractName: string;
  contractPackageHash?: string;
}

export interface MintMultipleArgs {
  contractHash: string;
  tokens: { tokenOwner: CLKeyParameters; tokenMeta: object }[];
}
