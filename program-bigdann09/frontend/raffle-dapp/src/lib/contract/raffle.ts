/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/raffle.json`.
 */
export type Raffle = {
  "address": "649vJ9q8JBKY7pvc5Uspwf6diESX4qKKjVQ1DTCubNQX",
  "metadata": {
    "name": "raffle",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyTicket",
      "discriminator": [
        11,
        24,
        17,
        193,
        168,
        116,
        164,
        169
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "ticket",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  99,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "raffle"
              },
              {
                "kind": "arg",
                "path": "ticketId"
              }
            ]
          }
        },
        {
          "name": "raffle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raffle.owner",
                "account": "raffle"
              },
              {
                "kind": "arg",
                "path": "raffleId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "raffleId",
          "type": "string"
        },
        {
          "name": "ticketId",
          "type": "u32"
        }
      ]
    },
    {
      "name": "claimPrize",
      "discriminator": [
        157,
        233,
        139,
        121,
        246,
        62,
        234,
        235
      ],
      "accounts": [
        {
          "name": "winner",
          "writable": true,
          "signer": true
        },
        {
          "name": "raffle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raffle.owner",
                "account": "raffle"
              },
              {
                "kind": "arg",
                "path": "raffleId"
              }
            ]
          }
        },
        {
          "name": "ticket",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  99,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "raffle"
              },
              {
                "kind": "account",
                "path": "ticket.ticket_id",
                "account": "ticket"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "raffleId",
          "type": "string"
        }
      ]
    },
    {
      "name": "createRaffle",
      "discriminator": [
        226,
        206,
        159,
        34,
        213,
        207,
        98,
        126
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "raffle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "raffleId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "raffleId",
          "type": "string"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "maxEntries",
          "type": "u32"
        }
      ]
    },
    {
      "name": "pickWinner",
      "discriminator": [
        227,
        62,
        25,
        73,
        132,
        106,
        68,
        96
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "raffle"
          ]
        },
        {
          "name": "raffle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "raffleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "raffleId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "raffle",
      "discriminator": [
        143,
        133,
        63,
        173,
        138,
        10,
        142,
        200
      ]
    },
    {
      "name": "ticket",
      "discriminator": [
        41,
        228,
        24,
        165,
        78,
        90,
        235,
        200
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidTicketPrice",
      "msg": "Invalid ticket price. Must be greater than zero."
    },
    {
      "code": 6001,
      "name": "invalidMaxEntries",
      "msg": "Invalid maximum entries. Must be greater than zero."
    },
    {
      "code": 6002,
      "name": "raffleNotActive",
      "msg": "Raffle is not active."
    },
    {
      "code": 6003,
      "name": "raffleAlreadyClaimed",
      "msg": "Raffle has already been claimed."
    },
    {
      "code": 6004,
      "name": "noEntries",
      "msg": "No entries in the raffle."
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Unauthorized action."
    },
    {
      "code": 6006,
      "name": "winnerAlreadySelected",
      "msg": "Winner has already been selected."
    },
    {
      "code": 6007,
      "name": "raffleSoldOut",
      "msg": "Raffle is sold out."
    },
    {
      "code": 6008,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to buy ticket."
    },
    {
      "code": 6009,
      "name": "entriesNotFull",
      "msg": "Entries not full"
    },
    {
      "code": 6010,
      "name": "winnerChosen",
      "msg": "Raffle winner already chosen"
    },
    {
      "code": 6011,
      "name": "winnerNotChosen",
      "msg": "Raffle winner not chosen"
    },
    {
      "code": 6012,
      "name": "invalidWinner",
      "msg": "Invalid winner"
    },
    {
      "code": 6013,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6014,
      "name": "randomnessAlreadyRevealed",
      "msg": "Randomness already revealed"
    },
    {
      "code": 6015,
      "name": "invalidRandomnessAccount",
      "msg": "Invalid randomness account"
    },
    {
      "code": 6016,
      "name": "randomnessExpired",
      "msg": "Randomness expired"
    },
    {
      "code": 6017,
      "name": "randomnessNotResolved",
      "msg": "Randomness not resolved"
    },
    {
      "code": 6018,
      "name": "randomNumberGenerationFailed",
      "msg": "Random number generation failed"
    }
  ],
  "types": [
    {
      "name": "raffle",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "raffleId",
            "type": "string"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "maxEntries",
            "type": "u32"
          },
          {
            "name": "entries",
            "type": "u32"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "isClaimed",
            "type": "bool"
          },
          {
            "name": "winnerTicket",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ticket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raffle",
            "type": "pubkey"
          },
          {
            "name": "ticketId",
            "type": "u32"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "seed",
      "type": "string",
      "value": "\"anchor\""
    }
  ]
};
