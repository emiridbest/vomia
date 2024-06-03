/* eslint-disable react-hooks/exhaustive-deps */

import React from 'react';
import { Order } from './index';
import { useRouter } from 'next/router';

enum FiatCurrency {
    NGN = 0, // Nigerian Naira
    KSH = 1, // Kenyan Shilling
    UGX = 2, // Ugandan Shilling
    GHS = 3  // Ghanaian Cedi
}

interface OrderCardProps {
    order: Order;
    isSellOrder: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isSellOrder }) => {
    const router = useRouter();

    const handleViewDetails = (id: number, isSellOrder: boolean) => {
        router.push(`/orderDetails?id=${id}&isSellOrder=${isSellOrder}`);
    };

    return (
        <div className="flex justify-between items-center gap-2 py-4 px-6 rounded-lg shadow-md m-2 bg-black text-white">
            <div className="flex flex-col items-start">
                <div className="font-bold">{isSellOrder ? 'Sell Order' : 'Buy Order'} #{order?.[0].toString()}</div>
                <div className="text-sm whitespace-nowrap">Units: {order?.[1].toString()}</div>
                <div className="text-sm whitespace-nowrap">Price: {order?.[2].toString()}</div>
            </div>
            <div className="flex flex-col items-start mt-6">
                {isSellOrder && <div className="text-sm whitespace-nowrap">Bank: {order?.[4]}</div>}
                <div className="text-sm whitespace-nowrap">Fiat: {FiatCurrency[order?.[8]]}</div>
            </div>
            <div className="flex flex-col items-start">
                <button
                    onClick={() => handleViewDetails(order?.[0].toString(), isSellOrder)}
                    className="mt-8 ml-4 py-1 px-3 bg-prosperity text-black text-sm font-light rounded"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default OrderCard;
