export const creativeProofAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "contentHash", type: "bytes32" },
      { name: "metadataURI", type: "string" }
    ],
    outputs: [{ name: "tokenId", type: "uint256" }]
  },
  {
    type: "event",
    name: "Minted",
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "contentHash", type: "bytes32" },
      { indexed: false, name: "metadataURI", type: "string" }
    ]
  }
] as const;
