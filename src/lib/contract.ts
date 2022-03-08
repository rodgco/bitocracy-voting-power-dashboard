import { ethers } from 'ethers';

import { writable } from 'svelte/store';
import type { Readable, Writable, Subscriber, Unsubscriber } from 'svelte/store';

import networks from '$lib/networks.json';

interface IContractState {
	hasWallet: boolean;
	correctChain: boolean;
	chainId: number;
	currentAccount: string;
}

interface IOptions {
	forceChain?: boolean;
	pollingInterval?: number;
	reloadOnChainChage?: boolean;
}

interface INetwork {
	chainId: number;
	name?: string;
	rpc?: string[];
	shortName?: string;
	chain?: string;
	iconUrls?: string[];
	nativeCurrency?: { name: string; symbol: string; decimals: number };
}

export default class Contract<TContract extends ethers.BaseContract, TState>
	implements Readable<TState & IContractState>
{
	protected network: INetwork;
	protected provider: ethers.providers.JsonRpcProvider;
	protected signer: ethers.Signer;
	protected contract: TContract;

	protected state: Writable<TState & IContractState>;
	protected options: IOptions = {
		reloadOnChainChage: true,
		forceChain: true,
		pollingInterval: 4000
	};

	public subscribe: (
		run: Subscriber<TState & IContractState>,
		invalidate: (value: TState & IContractState) => void
	) => Unsubscriber;

	constructor(
		chainId: string | number,
		address: string,
		abi: ethers.ContractInterface,
		initialState: TState,
		options: IOptions = {}
	) {
		chainId = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;

		this.network = <INetwork>networks.find((entry: any) => entry.chainId === chainId) || {
			chainId: 1
		};

		this.options = { ...this.options, ...options };

		/**
		 *      _
		 *  ___| |_ ___  _ __ ___
		 * / __| __/ _ \| '__/ _ \
		 * \__ \ || (_) | | |  __/
		 * |___/\__\___/|_|  \___|
		 *
		 */
		this.state = writable({
			...initialState,
			hasWallet: false,
			correctChain: false,
			chainId: null,
			currentAccount: null
		});
		this.subscribe = this.state.subscribe; // Class "implements store" hack!

		/**
		 *                        _     _
		 *   _ __  _ __ _____   _(_) __| | ___ _ __ ___
		 *  | '_ \| '__/ _ \ \ / / |/ _` |/ _ \ '__/ __|
		 *  | |_) | | | (_) \ V /| | (_| |  __/ |  \__ \
		 *  | .__/|_|  \___/ \_/ |_|\__,_|\___|_|  |___/
		 *  |_|
		 */
		// JsonRpcProvider
		this.provider = <ethers.providers.JsonRpcProvider>(
			ethers.getDefaultProvider(this.network.rpc ? this.network.rpc[0] : null)
		);

		this.provider.pollingInterval = options.pollingInterval || 4000;

		this.state.update((current) => ({
			...current,
			chainId: +chainId,
			correctChain: chainId === this.network.chainId
		}));

		/**
		 * Initialize Contract
		 */
		this.contract = <TContract>new ethers.Contract(address, abi, this.provider);
	}
}
