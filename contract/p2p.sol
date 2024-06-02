// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract P2p {
    ERC20 private CUSD;
    //0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1 testnet 0x9d64645979c57195f83735adf4d5a913943e4e3e 0xf7e888ef8da739b5f7e872d2bdaa9005facb735c
    //0x765DE816845861e75A25fCA122bb6898B8B1282a mainnet
    enum Fiat {
        NGN, // Nigerian Naira
        KSH, // Kenyan Shilling
        UGX, // Ugandan Shilling
        GHS // Ghanaian Cedi
    }

    struct Order {
        uint256 id;
        uint256 amount;
        uint256 price;
        uint256 accountNumber;
        string bank;
        string[] messages;
        bool isActive;
        bool isComplete;
        address seller;
        address buyer;
        Fiat fiatCurrency;
    }

    Order[] public sellOrders;
    Order[] public buyOrders;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    modifier onlySeller(uint256 _id, bool isSellOrder) {
        require(
            msg.sender ==
                (isSellOrder ? sellOrders[_id].seller : buyOrders[_id].seller),
            "Unauthorized action"
        );
        _;
    }

    modifier onlyBuyer(uint256 _id, bool isSellOrder) {
        require(
            msg.sender ==
                (isSellOrder ? sellOrders[_id].buyer : buyOrders[_id].buyer),
            "Unauthorized action"
        );
        _;
    }

    constructor(address _CUSDAddress) {
        owner = msg.sender;
        CUSD = ERC20(_CUSDAddress);
    }

    // Add a new sell order
    function addSellOrder(
        uint256 _amount,
        uint256 _price,
        Fiat _fiat,
        uint256 _accountNumber,
        string memory _bank
    ) public {
        require(
            CUSD.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed. Make sure to approve the contract to spend the cUSD tokens."
        );

        sellOrders.push(
            Order({
                id: sellOrders.length,
                amount: _amount,
                price: _price,
                isActive: false,
                isComplete: false,
                seller: msg.sender,
                buyer: address(0),
                messages: new string[](0),
                fiatCurrency: _fiat,
                accountNumber: _accountNumber,
                bank: _bank
            })
        );
    }

    // Add a new buy order
    function addBuyOrder(
        uint256 _amount,
        uint256 _price,
        Fiat _fiat,
        uint256 _accountNumber,
        string memory _bank
    ) public {
        buyOrders.push(
            Order({
                id: buyOrders.length,
                amount: _amount,
                price: _price,
                isActive: false,
                isComplete: false,
                seller: address(0),
                buyer: msg.sender,
                messages: new string[](0),
                fiatCurrency: _fiat,
                accountNumber: _accountNumber,
                bank: _bank
            })
        );
    }

    // Activate a sell order
    function updateSellOrderToActive(uint256 _id) public {
        require(!sellOrders[_id].isActive, "Sell order already active");
        require(
            msg.sender != sellOrders[_id].seller,
            "Seller cannot be the Buyer"
        );
        sellOrders[_id].isActive = true;
        sellOrders[_id].buyer = msg.sender;
    }

    // Activate a buy order
    function updateBuyOrderToActive(uint256 _id) public {
        require(!buyOrders[_id].isActive, "Buy order already active");
        require(
            msg.sender != buyOrders[_id].buyer,
            "Buyer cannot be the Seller"
        );
        buyOrders[_id].isActive = true;
        buyOrders[_id].seller = msg.sender;
    }

    // Mark a sell order as paid and complete the transaction
    function updateSellOrderToPaid(uint256 _id) public onlyBuyer(_id, true) {
        require(sellOrders[_id].isActive, "Sell order is not active");
        require(
            CUSD.transfer(sellOrders[_id].buyer, sellOrders[_id].amount),
            "Transfer failed."
        );
        sellOrders[_id].isComplete = true;
    }

    // Mark a buy order as paid and complete the transaction
    function updateBuyOrderToPaid(uint256 _id) public onlySeller(_id, false) {
        require(buyOrders[_id].isActive, "Buy order not active");
        require(
            CUSD.transfer(buyOrders[_id].buyer, buyOrders[_id].amount),
            "Transfer failed."
        );
        buyOrders[_id].isComplete = true;
    }

    // Cancel a sell order and return the tokens to the seller
    function cancelSellOrder(uint256 _id) public onlySeller(_id, true) {
        require(
            CUSD.transfer(sellOrders[_id].seller, sellOrders[_id].amount),
            "Transfer failed."
        );
        sellOrders[_id].isComplete = true;
    }

    // Cancel a buy order
    function cancelBuyOrder(uint256 _id) public onlyBuyer(_id, false) {
        buyOrders[_id].isComplete = true;
    }

    // Get orders by fiat currency
    function getOrdersByFiat(Fiat _fiat, bool isSellOrder)
        public
        view
        returns (Order[] memory)
    {
        Order[] memory orders = isSellOrder ? sellOrders : buyOrders;
        uint256 count = 0;
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].fiatCurrency == _fiat && !orders[i].isComplete) {
                count++;
            }
        }
        Order[] memory filteredOrders = new Order[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].fiatCurrency == _fiat && !orders[i].isComplete) {
                filteredOrders[index] = orders[i];
                index++;
            }
        }
        return filteredOrders;
    }

    // Get total sold amount by fiat currency for sell orders
    function getTotalSellAmountByFiat(Fiat _fiat)
        public
        view
        returns (uint256)
    {
        uint256 total = 0;
        for (uint256 i = 0; i < sellOrders.length; i++) {
            if (
                sellOrders[i].fiatCurrency == _fiat && sellOrders[i].isComplete
            ) {
                total += sellOrders[i].amount;
            }
        }
        return total;
    }

    // Get total sold amount by fiat currency for buy orders
    function getTotalBuyAmountByFiat(Fiat _fiat) public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < buyOrders.length; i++) {
            if (buyOrders[i].fiatCurrency == _fiat && buyOrders[i].isComplete) {
                total += buyOrders[i].amount;
            }
        }
        return total;
    }

    // Send message within a sell order
    function sendSellOrderMessage(uint256 _id, string memory message) public {
        require(
            msg.sender == sellOrders[_id].buyer ||
                msg.sender == sellOrders[_id].seller,
            "Unauthorized action"
        );
        sellOrders[_id].messages.push(message);
    }

    // Send message within a buy order
    function sendBuyOrderMessage(uint256 _id, string memory message) public {
        require(
            msg.sender == buyOrders[_id].buyer ||
                msg.sender == buyOrders[_id].seller,
            "Unauthorized action"
        );
        buyOrders[_id].messages.push(message);
    }

    // Get all messages in an order
    function getAllMessages(uint256 _id, bool isSellOrder)
        public
        view
        returns (string[] memory)
    {
        return isSellOrder ? sellOrders[_id].messages : buyOrders[_id].messages;
    }

    // Get open sell orders
    function getOpenSellOrders() public view returns (Order[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < sellOrders.length; i++) {
            if (!sellOrders[i].isComplete && !sellOrders[i].isActive) {
                count++;
            }
        }
        Order[] memory openSellOrders = new Order[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < sellOrders.length; i++) {
            if (!sellOrders[i].isComplete && !sellOrders[i].isActive) {
                openSellOrders[index] = sellOrders[i];
                index++;
            }
        }
        return openSellOrders;
    }

    // Get open buy orders
    function getOpenBuyOrders() public view returns (Order[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < buyOrders.length; i++) {
            if (!buyOrders[i].isComplete && !buyOrders[i].isActive) {
                count++;
            }
        }
        Order[] memory openBuyOrders = new Order[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < buyOrders.length; i++) {
            if (!buyOrders[i].isComplete && !buyOrders[i].isActive) {
                openBuyOrders[index] = buyOrders[i];
                index++;
            }
        }
        return openBuyOrders;
    }

    // Get details of a sell order using the id
    function getSellOrderDetails(uint256 _id)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            string memory,
            string[] memory,
            address,
            address,
            Fiat
        )
    {
        Order storage sellOrder = sellOrders[_id];

        return (
            sellOrders[_id].id,
            sellOrders[_id].amount,
            sellOrders[_id].price,
            sellOrders[_id].accountNumber,
            sellOrders[_id].bank,
            sellOrders[_id].messages,
            sellOrders[_id].seller,
            sellOrders[_id].buyer,
            sellOrders[_id].fiatCurrency
        );
    }

    // Get details of a buy order
    function getBuyOrderDetails(uint256 _id)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            string memory,
            string[] memory,
            address,
            address,
            Fiat
        )
    {
        Order storage buyOrder = buyOrders[_id];

        return (
            buyOrders[_id].id,
            buyOrders[_id].amount,
            buyOrders[_id].price,
            buyOrders[_id].accountNumber,
            buyOrders[_id].bank,
            buyOrders[_id].messages,
            buyOrders[_id].seller,
            buyOrders[_id].buyer,
            buyOrders[_id].fiatCurrency
        );
    }
}
