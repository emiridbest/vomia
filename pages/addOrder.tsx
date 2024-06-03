import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { contractAddress, abi } from '@/utils/abi';
import { BrowserProvider, Contract } from 'ethers';
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";

enum FiatCurrency {
    NGN = 0, // Nigerian Naira
    KSH = 1, // Kenyan Shilling
    UGX = 2, // Ugandan Shilling
    GHS = 3  // Ghanaian Cedi
}

const AddOrder: React.FC = () => {
    const [amount, setAmount] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [bank, setBank] = useState<string>('');
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [fiatCurrency, setFiatCurrency] = useState<FiatCurrency>(FiatCurrency.NGN);
    const router = useRouter();

    const handleAddSellOrder = async (_amount: number, price: number, bank: string, accountNumber: string, fiatCurrency: FiatCurrency) => {
        if (window.ethereum) {
            try {
                const amount = _amount * 1e18;
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contract = new Contract(contractAddress, abi, signer);
                const tx = await contract.addSellOrder(amount, price, fiatCurrency, BigInt(accountNumber), bank);
                await tx.wait();
                router.push('/');
            } catch (error) {
                console.error("Error adding sell order:", error);
            }
        }
    };

    const handleAddBuyOrder = async (amount: number, price: number, bank: string, accountNumber: string, fiatCurrency: FiatCurrency) => {
        if (window.ethereum) {
            try {
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contract = new Contract(contractAddress, abi, signer);
                const tx = await contract.addBuyOrder(amount, price, fiatCurrency, BigInt(accountNumber), bank);
                await tx.wait();
                router.push('/');
            } catch (error) {
                console.error("Error adding buy order:", error);
            }
        }
    };

    const handleReturnHome = () => {
        router.push('/');
    };

    return (
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 font-light text-1xl">
            <ArrowLeftCircleIcon
                onClick={handleReturnHome}
                className="h-6 cursor-pointer"
            />
            <div className="flex justify-center mt-2">
                <h2 className="text-2xl font-semi-bold">Add Order</h2>
            </div>
            <div className="mt-2">
                <label className="block text-sm text-sm">Units</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="border border-prosperity bg-black text-prosperity rounded-lg p-2 w-full"
                />
            </div>
            <div className="mt-2">
                <label className="block text-sm">Price</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="border border-prosperity bg-black text-prosperity rounded-lg p-2 w-full"
                />
            </div>
            <div className="mt-2">
                <label className="block text-sm">Bank</label>
                <input
                    type="text"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="border border-prosperity bg-black text-prosperity rounded-lg p-2 w-full"
                />
            </div>
            <div className="mt-2">
                <label className="block text-sm">Account Number</label>
                <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="border border-prosperity bg-black text-prosperity rounded-lg p-2 w-full"
                />
            </div>
            <div className="mt-2">
                <label className="block text-sm">Fiat Currency</label>
                <select
                    value={fiatCurrency}
                    onChange={(e) => setFiatCurrency(Number(e.target.value) as FiatCurrency)}
                    className="border text-sm border-prosperity bg-black text-prosperity rounded-lg p-2 w-full"
                >
                    <option value={FiatCurrency.NGN}>NGN</option>
                    <option value={FiatCurrency.KSH}>KSH</option>
                    <option value={FiatCurrency.UGX}>UGX</option>
                    <option value={FiatCurrency.GHS}>GHS</option>
                </select>
            </div>
            <div className="mt-2 flex gap-4 text-sm">
                <button
                    onClick={() => handleAddSellOrder(amount, price, bank, accountNumber, fiatCurrency)}
                    className="py-2 px-3 bg-black text-prosperity rounded-lg"
                >
                    Add Sell Order
                </button>
                <button
                    onClick={() => handleAddBuyOrder(amount, price, bank, accountNumber, fiatCurrency)}
                    className="py-2 px-3 bg-black text-prosperity text-sm rounded-lg"
                >
                    Add Buy Order
                </button>
            </div>
        </div>
    );
};

export default AddOrder;
function parseEthers(_amount: number) {
    throw new Error('Function not implemented.');
}

