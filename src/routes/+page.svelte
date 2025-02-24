<!-- src/routes/+page.svelte -->
<script lang="ts">
    import type { PageData } from "./$types";
    import TufJSON from "$lib/TufJSON/TufJSON.svelte";
    import { tufStore } from "$lib/stores";

    export let data: PageData;

    let dragActive = false;
    let fileInput: HTMLInputElement;
    let selectedFile: string | null = null;

    const requiredFiles = {
        "root.json": { uploaded: false },
        "targets.json": { uploaded: false },
        "snapshot.json": { uploaded: false },
        "timestamp.json": { uploaded: false },
        "keyinfo.json": { uploaded: false },
    };

    async function handleFiles(files: FileList | null) {
        if (!files) return;

        for (const file of files) {
            try {
                const content = await file.text();
                const json = JSON.parse(content);

                if (file.name === "keyinfo.json") {
                    tufStore.addKeyInfo(json);
                    requiredFiles["keyinfo.json"].uploaded = true;
                } else if (requiredFiles[file.name]) {
                    tufStore.addFile(file.name, json);
                    requiredFiles[file.name].uploaded = true;
                }
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
            }
        }
    }

    function viewFile(fileName: string) {
        selectedFile = fileName;
    }

    $: uploadedFiles = Object.keys($tufStore.files);
    $: hasAllFiles = Object.values(requiredFiles).every((f) => f.uploaded);

    // Add this to your existing script section
    let showRawJson = false;
</script>

<div class="container">
    <div class="upload-container">
        <header class="header">
            <div class="logo">
                <img
                    src="https://avatars.githubusercontent.com/u/4633028?s=48&v=4"
                    alt="TUF Logo"
                />
                <span>TUF Explorer</span>
            </div>
        </header>

        <div class="card-container">
            <!-- Left card -->
            <div
                class="card upload-section"
                class:drag-active={dragActive}
                on:dragover|preventDefault={() => (dragActive = true)}
                on:dragleave={() => (dragActive = false)}
                on:drop|preventDefault={(e) => {
                    dragActive = false;
                    handleFiles(e.dataTransfer?.files);
                }}
            >
                <div class="upload-content">
                    <div class="file-icon">
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
                            ></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                    </div>
                    <h2>Upload TUF Repository Files</h2>
                    <p>Drag and drop your TUF JSON files here</p>
                    <div class="browse-section">
                        <button
                            class="browse-btn"
                            on:click={() => fileInput.click()}
                        >
                            browse files
                            <div class="upload-icon">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                    ></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                            </div>
                        </button>
                    </div>
                    <input
                        type="file"
                        bind:this={fileInput}
                        on:change={(e) => handleFiles(e.target?.files)}
                        accept=".json"
                        multiple
                        style="display: none"
                    />
                </div>
            </div>

            <!-- Right card -->
            <div class="card required-files">
                <h3>Required files:</h3>
                <div class="files-list">
                    {#each Object.entries(requiredFiles) as [fileName, status]}
                        <div
                            class="file-status"
                            class:uploaded={status.uploaded}
                        >
                            {fileName}
                            {status.uploaded ? "✓" : "✗"}
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        {#if hasAllFiles}
            <div class="repository-state">
                <h2>TUF Repository State</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Type</th>
                            <th>Signing starts</th>
                            <th>Expires</th>
                            <th>Version</th>
                            <th>Signers</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each uploadedFiles as filename}
                            {@const metadata = $tufStore.files[filename].signed}
                            <tr>
                                <td>
                                    {filename}
                                    <span class="json-link"
                                        >(<a href="#json">json</a>)</span
                                    >
                                </td>
                                <td>{metadata._type}</td>
                                <td
                                    >{metadata.signing_starts ||
                                        "2025-07-04"}</td
                                >
                                <td>{metadata.expires}</td>
                                <td>{metadata.version}</td>
                                <td class="signers-cell">
                                    {#if metadata.roles && metadata.roles[filename]}
                                        {@const role = metadata.roles[filename]}
                                        <span class="signers">
                                            {#if role.keyids && role.keyids.length > 0}
                                                {@const required =
                                                    role.threshold || 1}
                                                {#each role.keyids as keyid}
                                                    <span class="signer"
                                                        >@{keyid.substring(
                                                            0,
                                                            8,
                                                        )}</span
                                                    >
                                                {/each}
                                                <span class="threshold"
                                                    >({required} of {role.keyids
                                                        .length} required)</span
                                                >
                                            {:else}
                                                <span class="online-key"
                                                    >online key (1 of 1
                                                    required)</span
                                                >
                                            {/if}
                                        </span>
                                    {:else}
                                        <span class="online-key"
                                            >online key (1 of 1 required)</span
                                        >
                                    {/if}
                                </td>
                                <td>
                                    <button
                                        class="view-details"
                                        on:click={() => viewFile(filename)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>

                <!-- Add this section for the metadata viewer -->
                {#if selectedFile}
                    <div class="card metadata-viewer">
                        <div class="viewer-header">
                            <h3>{selectedFile}</h3>
                            <button
                                class="close-btn"
                                on:click={() => (selectedFile = null)}>×</button
                            >
                        </div>
                        <div class="json-content">
                            <div class="json-controls">
                                <label class="raw-json-toggle">
                                    <input
                                        type="checkbox"
                                        bind:checked={showRawJson}
                                    /> raw JSON
                                </label>
                            </div>

                            {#if showRawJson}
                                <div class="raw-json-container">
                                    <pre class="raw-json-code">{JSON.stringify(
                                            $tufStore.files[selectedFile],
                                            null,
                                            2,
                                        )}</pre>
                                </div>
                            {:else}
                                <div class="json-section">
                                    <h4>Signed By</h4>
                                    <div class="key-item">
                                        <a href="#" class="key-link"
                                            >Root Signing Key (RSA)</a
                                        >
                                    </div>
                                </div>
                                <div class="json-section">
                                    <h4>Signed</h4>
                                    <div class="json-tree">
                                        <TufJSON
                                            json={$tufStore.files[selectedFile]}
                                        />
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .container {
        width: 450%;
        margin: 0 auto;
        padding: 2rem;
    }

    .upload-container {
        width: 100%;
        padding: 0;
        background: white;
    }

    .header {
        margin-bottom: 3rem;
        padding: 0;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .logo img {
        width: 48px;
        height: 48px;
    }

    .logo span {
        font-size: 2rem;
        color: #333;
        font-weight: bold;
        white-space: nowrap;
    }

    .metadata-viewer {
        margin-top: 2rem;
        padding: 2rem;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .viewer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #eee;
    }

    .viewer-header h3 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
        font-weight: 600;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.75rem;
        cursor: pointer;
        color: #666;
        transition: all 0.2s;
        padding: 0.5rem;
        line-height: 1;
        border-radius: 4px;
    }

    .close-btn:hover {
        background: #f5f5f5;
        color: #333;
    }

    .json-content {
        padding: 1rem 0;
    }

    .json-controls {
        margin-bottom: 1.5rem;
    }

    .raw-json-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #666;
        font-size: 0.9rem;
        cursor: pointer;
    }

    .raw-json-toggle input {
        margin: 0;
    }

    .json-section {
        margin-bottom: 2rem;
    }

    .json-section h4 {
        margin: 0 0 1rem 0;
        color: #666;
        font-size: 1rem;
        font-weight: 500;
    }

    .key-item {
        padding: 0.5rem 0;
    }

    .key-link {
        color: #0066cc;
        text-decoration: none;
        font-size: 0.9rem;
    }

    .key-link:hover {
        text-decoration: underline;
    }

    .json-tree {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        font-family: monospace;
        font-size: 0.9rem;
        max-height: 500px;
        overflow-y: auto;
    }

    /* Add custom scrollbar for the JSON tree */
    .json-tree::-webkit-scrollbar {
        width: 8px;
    }

    .json-tree::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    .json-tree::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }

    .json-tree::-webkit-scrollbar-thumb:hover {
        background: #999;
    }

    .card-container {
        display: flex;
        gap: 2rem;
        justify-content: center;
        width: 100%;
        margin: 2rem 0;
    }

    .card {
        flex: 1;
        background: white;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        min-height: 300px;
        transition: all 0.3s ease;
    }

    .card:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    .upload-section {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        transition: all 0.3s ease;
        border: 2px dashed #e0e0e0;
    }

    .upload-section.drag-active {
        border-color: #6f42c1;
        background: rgba(111, 66, 193, 0.05);
    }

    .upload-content {
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
    }

    .file-icon {
        color: #6f42c1;
        opacity: 0.8;
        transition: all 0.3s ease;
    }

    .file-icon:hover {
        opacity: 1;
        transform: scale(1.05);
    }

    h2 {
        margin: 0;
        font-size: 1.75rem;
        color: #333;
        font-weight: 600;
    }

    .metadata-viewer {
        margin-top: 2rem;
        padding: 2rem;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .json-content {
        margin-top: 1rem;
        max-height: 500px;
        overflow-y: auto;
    }

    .viewer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1rem;
        border-bottom: 1px solid #dee2e6;
    }

    .viewer-header h3 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
    }

    p {
        margin: 0;
        color: #666;
        font-size: 1rem;
    }

    .browse-section {
        margin-top: 1rem;
    }

    .browse-btn {
        background: none;
        border: none;
        color: #6f42c1;
        cursor: pointer;
        font-weight: 500;
        font-size: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        transition: all 0.3s ease;
    }

    .browse-btn:hover {
        transform: translateY(-2px);
    }

    .upload-icon {
        color: #6f42c1;
        margin-top: 0.5rem;
    }

    .required-files {
        display: flex;
        flex-direction: column;
    }

    .files-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .file-status {
        padding: 1rem;
        background: #ffe5e5;
        border-radius: 8px;
        color: #dc3545;
        font-family: monospace;
    }

    .file-status.uploaded {
        background: #e8f5e9;
        color: #28a745;
    }

    .repository-state {
        margin-top: 3rem;
        padding: 0;
        border-top: 1px solid #dee2e6;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1.5rem;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    th,
    td {
        padding: 1.2rem;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
    }

    th {
        background: #f8f9fa;
        font-weight: 600;
        color: #333;
    }

    .json-link {
        margin-left: 0.5rem;
        color: #0066cc;
        font-size: 0.9em;
    }

    .json-link a {
        color: inherit;
        text-decoration: none;
    }

    .signers-cell {
        font-size: 0.9em;
    }

    .signers {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
    }

    .signer {
        color: #666;
    }

    .threshold {
        color: #666;
        font-size: 0.9em;
    }

    .online-key {
        color: #666;
        font-style: italic;
    }

    .generation-info {
        margin-top: 2rem;
        padding: 1rem;
        color: #666;
        font-size: 0.9em;
        border-top: 1px solid #eee;
    }

    .generation-info a {
        color: #0066cc;
        text-decoration: none;
    }

    .generation-info a:hover {
        text-decoration: underline;
    }

    .view-details {
        background: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .view-details:hover {
        background: #0056b3;
    }

    .metadata-viewer {
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .viewer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6c757d;
        transition: color 0.2s;
    }

    .close-btn:hover {
        color: #343a40;
    }

    .raw-json-container {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1.5rem;
        margin-top: 1rem;
        border: 1px solid #eee;
    }

    .raw-json-code {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
        font-size: 0.9rem;
        line-height: 1.5;
        color: #333;
    }

    /* Add custom scrollbar for raw JSON */
    .raw-json-container::-webkit-scrollbar {
        width: 8px;
    }

    .raw-json-container::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    .raw-json-container::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }

    .raw-json-container::-webkit-scrollbar-thumb:hover {
        background: #999;
    }
    
    @media (max-width: 768px) {
        .container {
            width: 95%;
            padding: 1rem;
        }

        .card-container {
            flex-direction: column;
            gap: 1rem;
        }

        .card {
            padding: 1.5rem;
        }

        table {
            display: block;
            overflow-x: auto;
        }
    }
</style>
