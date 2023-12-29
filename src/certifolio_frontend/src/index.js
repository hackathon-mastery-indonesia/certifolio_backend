import { icp_login_backend } from "../../declarations/certifolio_backend";
import { Actor, HttpAgent } from "@dfinity/agent";
import {AuthClient} from "@dfinity/auth-client";

import { idlFactory } from "../../declarations/certifolio_backend/certifolio_backend.did.js";

let globalIdentity;

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = e.target.querySelector("button");

  const name = document.getElementById("name").value.toString();

  button.setAttribute("disabled", true);

  // Interact with foo actor, calling the greet method
  const greeting = await icp_login_backend.greet(name);

  button.removeAttribute("disabled");

  document.getElementById("greeting").innerText = greeting;

  return false;
});

//login button
document.querySelector("#login").addEventListener("click", async (e) => {
  e.preventDefault();

  const authClient = await AuthClient.create();
  await authClient.login({
    maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000000000),
    onSuccess: async () => {
      await handleAuthenticated(authClient);
    },
    identityProvider: process.env.DFX_NETWORK === "ic" ? "https://identity.ic0.app/#authorize" : "http://localhost:4943/?canisterId=" + process.env.INTERNET_IDENTITY_CANISTER_ID,
  });
  async function  handleAuthenticated(authClient){
    console.log("Authenticated with identity: ", authClient.getIdentity().getPrincipal().toString());
    const identity = authClient.getIdentity();
    globalIdentity = identity;
    console.log("identity", globalIdentity.getPrincipal().toString());
    const agent = new HttpAgent({ identity });
    if (process.env.DFX_NETWORK !== "ic") {
      agent.fetchRootKey().catch((err) => {
        console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
        console.error(err);
      });
    }
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: process.env.CANISTER_ID_CERTIFOLIO_BACKEND,
    });
    console.log("ppppppp");
    const principal = await actor.whoami();
    console.log("principal", principal.toString());
    };
}); 
