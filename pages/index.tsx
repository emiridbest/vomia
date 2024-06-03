/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from 'react';
import { contractAddress, abi } from '@/utils/abi';
import { BrowserProvider, Contract, ZeroAddress, ethers } from 'ethers';
import OrderCard from './orderCard';
import { useRouter } from 'next/router';
import { EyeIcon, LockClosedIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { getContract, formatEther, createPublicClient, http } from "viem";
import { celo, celoAlfajores } from "viem/chains";
import { stableTokenABI } from "@celo/abis";
import MyOrders from './myOrders';

const STABLE_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

export interface Order {
    [x: string]: any;
    id: number;
    amount: number;
    price: number;
    accountNumber: number;
    bank: string;
    messages: string[];
    seller: string;
    buyer: string;
    fiatCurrency: [0, 1, 2, 3];
}

const Main: React.FC = () => {
    const [sellOrders, setSellOrders] = useState<Order[]>([]);
    const [buyOrders, setBuyOrders] = useState<Order[]>([]);
    const [cUSDBalance, setCUSDBalance] = useState<string>('0');
    const [showBalanceDetails, setShowBalanceDetails] = useState<boolean>(true);
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const router = useRouter();

    const getOrders = useCallback(async () => {
        if (window.ethereum) {
            try {
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contract = new Contract(contractAddress, abi, signer);
                const address = await signer.getAddress();

                const sellOrderIds = await contract.getOpenSellOrders();
                const buyOrderIds = await contract.getOpenBuyOrders();

                const formattedSellOrders: Order[] = [];
                for (const sellOrderIdBN of sellOrderIds) {
                    const id = parseInt(sellOrderIdBN + 1);
                    const details = await contract.getSellOrderDetails(id);
                    formattedSellOrders.push({ ...details, key: id });
                }


                const formattedBuyOrders: Order[] = [];
                for (const buyOrderIdBN of buyOrderIds) {
                    const id = parseInt(buyOrderIdBN + 1);
                    const details = await contract.getBuyOrderDetails(id);
                    formattedBuyOrders.push({ ...details, key: id });
                    console.log(formattedBuyOrders);
                }

                setSellOrders(formattedSellOrders);
                setBuyOrders(formattedBuyOrders);

                const mySellOrders = formattedSellOrders.filter(order => order[6].toLowerCase() === address.toLowerCase());
                const myBuyOrders = formattedBuyOrders.filter(order => order[7].toLowerCase() === address.toLowerCase());
                setMyOrders([...mySellOrders, ...myBuyOrders]);

            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        }
    }, []);

    useEffect(() => {
        getOrders();
    }, [getOrders]);

    const handleAddOrder = () => {
        router.push('/addOrder');
    };

    const getCUSDBalance = useCallback(async () => {
        if (window.ethereum) {
            try {
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();

                const publicClient = createPublicClient({
                    chain: celoAlfajores,
                    transport: http(),
                });

                const StableTokenContract = getContract({
                    abi: stableTokenABI,
                    address: STABLE_TOKEN_ADDRESS,
                    publicClient,
                });
                const address = await signer.getAddress();
                let cleanedAddress = address.substring(2);
                const balanceInBigNumber = await StableTokenContract.read.balanceOf([`0x${cleanedAddress}`]);
                const balanceInWei = balanceInBigNumber;
                const balanceInEthers = formatEther(balanceInWei);

                setCUSDBalance(balanceInEthers);
            } catch (error) {
                console.error('Error fetching cUSD balance:', error);
            }
        }
    }, []);

    useEffect(() => {
        getOrders();
        getCUSDBalance();
    }, [getOrders, getCUSDBalance]);

    const toggleBalanceDetails = () => {
        setShowBalanceDetails(!showBalanceDetails);
    };

    return (
        <div className="bg-prosperity max-w-screen-xl mx-auto px-4 md:px-8">
            <div className="">
                <div className="max-w-lg">
                    <div className="flex justify-end">
                        <PlusCircleIcon
                            onClick={handleAddOrder}
                            className="h-8 mb-4 text-prosperity bg-black hover:bg-blue-700 duration-150 rounded-full cursor-pointer"
                        />
                    </div>
                    <p className="text-black mt-2 text-1xl">
                        Welcome to your No. 1 P2P trading gateway!!!
                    </p>
                    <>
                        <div className="my-4 p-4 bg-prosperity shadow rounded-lg">
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={toggleBalanceDetails}
                                    className="text-blue-500 hover:underline"
                                >
                                    {showBalanceDetails ? <LockClosedIcon
                                        className="h-5 text-black" /> : <EyeIcon className="text-black text-lg h-4" />}
                                </button>
                            </div>
                            {showBalanceDetails && (
                                <div className="mt-2 text-black text-4xl font-bold text-overflow-hidden">
                                    {cUSDBalance}cUSD
                                </div>
                            )}
                            <p className="text-sm">Your wallet balance</p>
                            <div className="flex justify-between">
                                <p className="text-sm">{new Date().toLocaleTimeString()}</p>
                                <p className="text-sm">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                    </>
                    <h3 className="text-black text-1xl ml-4 font-bold sm:text-2xl">
                        My Orders
                    </h3>
                    <div className="flex flex-col">
                        {myOrders.map(order => (
                            <MyOrders
                                key={order.id}
                                order={order}
                                isSellOrder={order[6]}
                            />
                        ))}
                    </div>
                    <h3 className="text-black text-1xl ml-4 font-bold sm:text-2xl">
                        Available Orders
                    </h3>

                </div>

                <div className="flex flex-col">
                    {sellOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            isSellOrder={true}
                        />
                    ))}
                    {buyOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            isSellOrder={false}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Main;
