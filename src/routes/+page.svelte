<!-- src/routes/+page.svelte -->
<script lang="ts">
    import type { PageData } from "./$types";
    import BreadCrumbs from "$lib/BreadCrumbs.svelte";
    import FileTree from "$lib/FileTree.svelte";
    import TufJSON from "$lib/TufJSON/TufJSON.svelte";
    import { tufStore } from "$lib/stores";
    import { onMount } from 'svelte';

    export let data: PageData;

    let dragActive = false;
    let fileInput: HTMLInputElement;
    let showFileContent = false;
    let selectedFile: string | null = null;

    $: fileTree = {
        repository: $tufStore.files
    };

    const requiredFiles = [
        'root.json',
        'targets.json',
        'snapshot.json',
        'timestamp.json',
        'keyinfo.json'
    ];

    async function handleFiles(files: FileList | null) {
        if (!files) return;
        
        for (const file of files) {
            try {
                const content = await file.text();
                const json = JSON.parse(content);
                
                if (file.name === 'keyinfo.json') {
                    tufStore.addKeyInfo(json);
                } else {
                    tufStore.addFile(file.name, json);
                }
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
            }
        }
    }

    function getMissingFiles() {
        return requiredFiles.filter(file => {
            if (file === 'keyinfo.json') {
                return Object.keys($tufStore.keyInfo).length === 0;
            }
            return !$tufStore.files[file];
        });
    }

    function viewFile(fileName: string) {
        selectedFile = fileName;
        showFileContent = true;
    }
</script>

<div class="container">
    <header class="topbar">
        <div class="logo">
            <h1>TUF Explorer</h1>
        </div>
        <BreadCrumbs items={[]}/>
    </header>

    <main class="content">
        <div class="upload-section" 
             class:drag-active={dragActive}
             on:dragover|preventDefault={() => dragActive = true}
             on:dragleave={() => dragActive = false}
             on:drop|preventDefault={(e) => {
                 dragActive = false;
                 handleFiles(e.dataTransfer?.files);
             }}>
            <input 
                type="file" 
                bind:this={fileInput}
                on:change={(e) => handleFiles(e.target?.files)}
                accept=".json"
                multiple
                style="display: none"
            />
            <div class="upload-content">
                <div class="upload-icon">📄</div>
                <h3>Upload TUF Repository Files</h3>
                <p>Drag and drop your TUF JSON files here or <button on:click={() => fileInput.click()}>browse files</button></p>
            </div>
        </div>

        {#if Object.keys($tufStore.files).length > 0}
            <div class="repository-view">
                <div class="file-tree">
                    <h3>Repository Files</h3>
                    <FileTree dir={fileTree} path="" />
                    
                    <div class="file-status">
                        <h4>Uploaded Files:</h4>
                        <ul>
                            {#each Object.keys($tufStore.files) as fileName}
                                <li class="success">
                                    {fileName} ✅
                                    <button on:click={() => viewFile(fileName)}>View</button>
                                </li>
                            {/each}
                        </ul>
                        
                        {#if getMissingFiles().length > 0}
                            <h4>Missing Files:</h4>
                            <ul>
                                {#each getMissingFiles() as fileName}
                                    <li class="missing">{fileName} ❌</li>
                                {/each}
                            </ul>
                        {/if}
                    </div>
                </div>

                {#if showFileContent && selectedFile}
                    <div class="file-content">
                        <h3>{selectedFile}</h3>
                        <TufJSON json={$tufStore.files[selectedFile]} />
                    </div>
                {/if}
            </div>
        {/if}
    </main>
</div>

<style>
    /* Previous styles remain... */

    .repository-view {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 2rem;
        margin-top: 2rem;
    }

    .file-tree {
        background: var(--card-background);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .file-content {
        background: var(--card-background);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .file-status li button {
        margin-left: 1rem;
        padding: 0.25rem 0.5rem;
        border: none;
        background: var(--primary-color);
        color: white;
        border-radius: 4px;
        cursor: pointer;
    }

    @media (max-width: 768px) {
        .repository-view {
            grid-template-columns: 1fr;
        }
    }
</style>