// src/lib/utils.ts
/**
Unless explicitly stated otherwise all files in this repository are licensed under the Apache-2 License.

This product includes software developed at Datadog (https://www.datadoghq.com/)  Copyright 2023-present Datadog, Inc.
**/

const separatorRegexp = new RegExp('/{1,}', 'g');

export function joinPath(parts: string[]) {
    return parts.join("/").replace(separatorRegexp, "/")
}

// Add new utility functions for file handling
export interface TufFile {
    name: string;
    content: any;
    isValid: boolean;
    error?: string;
}

export const REQUIRED_FILES = [
    'root.json',
    'targets.json',
    'snapshot.json',
    'timestamp.json',
    'keyinfo.json'
];

export function validateTufJson(content: any): boolean {
    try {
        // Basic TUF metadata validation
        if (!content.signed || !content.signatures) {
            return false;
        }

        // Check for required fields based on type
        if (content.signed._type === 'root') {
            return !!(content.signed.keys && content.signed.roles);
        } else if (content.signed._type === 'targets') {
            return 'targets' in content.signed;
        } else if (content.signed._type === 'snapshot') {
            return !!(content.signed.meta);
        } else if (content.signed._type === 'timestamp') {
            return !!(content.signed.meta);
        }

        return false;
    } catch (error) {
        return false;
    }
}

export function processTufFile(file: File): Promise<TufFile> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
            try {
                const content = JSON.parse(reader.result as string);
                const isValid = validateTufJson(content);
                
                resolve({
                    name: file.name,
                    content,
                    isValid,
                    error: isValid ? undefined : 'Invalid TUF metadata format'
                });
            } catch (error) {
                resolve({
                    name: file.name,
                    content: null,
                    isValid: false,
                    error: 'Invalid JSON format'
                });
            }
        };

        reader.onerror = () => {
            reject(new Error(`Error reading file: ${file.name}`));
        };

        reader.readAsText(file);
    });
}

export function getMissingFiles(uploadedFiles: { [key: string]: TufFile }): string[] {
    return REQUIRED_FILES.filter(file => !uploadedFiles[file]);
}