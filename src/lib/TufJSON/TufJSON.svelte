<!-- src/lib/TufJSON/TufJSON.svelte -->
<script lang="ts">
    import type * as TUF from "./types";
    import Key from "./Key.svelte";
    import TargetsMetadata from "./TargetsMetadata.svelte";
    import RootMetadata from "./RootMetadata.svelte";
    import { tufStore } from "$lib/stores";

    export let json: TUF.SignedMetadata;

    let raw: boolean = false;
    let showKeys: boolean = false;

    $: keys = $tufStore.keyInfo;
</script>

<input type="checkbox" id="raw" bind:checked={raw} />
<label for="raw">raw JSON</label>

{#if raw}
    <pre>{JSON.stringify(json, null, "    ")}</pre>
{:else}
    <p>Signed By</p>
    <ul>
        {#each json.signatures as signature}
            <li>
                <Key id={signature.keyid} keyInfo={keys[signature.keyid]} />
            </li>
        {/each}
    </ul>

    <p>Signed</p>
    {#if json.signed._type === "root"}
        <RootMetadata metadata={json.signed} {keys} {showKeys} />
    {:else}
        <TargetsMetadata metadata={json.signed} {keys} {showKeys} />
    {/if}
{/if}