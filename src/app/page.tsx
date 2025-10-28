'use client';

import {
  Download,
  Eye,
  FileText,
  GripVertical,
  Info,
  Plus,
  Trash2,
} from 'lucide-react';
import * as React from 'react';

import { generateCSV, generatePreview } from '@/lib/csvGenerator';
import { downloadCSV, generateFilename } from '@/lib/downloadHelper';
import { estimateFileSize } from '@/lib/fileSizeCalculator';
import { validateCSVConfig } from '@/lib/validators';

import {
  DATA_TYPE_LABELS,
  DELIMITER_LABELS,
  ENCODING_LABELS,
  LINE_ENDING_LABELS,
  QUOTE_CHAR_LABELS,
} from '@/constants/labels';

import {
  Column,
  CSVConfig,
  DataType,
  DEFAULT_COLUMNS,
  DEFAULT_FILE_CONFIG,
  DEFAULT_FORMAT_CONFIG,
  Delimiter,
  Encoding,
  FileConfig,
  FormatConfig,
  LineEnding,
  QuoteChar,
} from '@/types';

export default function HomePage() {
  const [fileConfig, setFileConfig] =
    React.useState<FileConfig>(DEFAULT_FILE_CONFIG);
  const [formatConfig, setFormatConfig] = React.useState<FormatConfig>(
    DEFAULT_FORMAT_CONFIG
  );
  const [columns, setColumns] = React.useState<Column[]>(DEFAULT_COLUMNS);
  const [nextColumnId, setNextColumnId] = React.useState(4);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewContent, setPreviewContent] = React.useState('');
  const [draggedColumnId, setDraggedColumnId] = React.useState<number | null>(
    null
  );
  const [dragOverColumnId, setDragOverColumnId] = React.useState<number | null>(
    null
  );

  // Calculate estimated file size
  const estimatedSize = React.useMemo(() => {
    if (columns.length === 0) return null;
    return estimateFileSize(
      columns,
      fileConfig.totalRows,
      fileConfig.headerLines,
      fileConfig.footerLines,
      formatConfig
    );
  }, [columns, fileConfig, formatConfig]);

  // Validate configuration
  const validation = React.useMemo(() => {
    const config: CSVConfig = {
      file: fileConfig,
      format: formatConfig,
      columns,
    };
    return validateCSVConfig(config);
  }, [fileConfig, formatConfig, columns]);

  const handleAddColumn = () => {
    setColumns([
      ...columns,
      {
        id: nextColumnId,
        name: `column_${nextColumnId}`,
        dataType: DataType.String,
      },
    ]);
    setNextColumnId(nextColumnId + 1);
  };

  const handleRemoveColumn = (id: number) => {
    setColumns(columns.filter((col) => col.id !== id));
  };

  const handleColumnChange = (
    id: number,
    field: keyof Column,
    value: string | DataType
  ) => {
    setColumns(
      columns.map((col) => (col.id === id ? { ...col, [field]: value } : col))
    );
  };

  const handleDragStart = (e: React.DragEvent, columnId: number) => {
    setDraggedColumnId(columnId);
    e.dataTransfer.effectAllowed = 'move';
    // Add a slight delay to allow the drag image to be created
    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumnId(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: number) => {
    e.preventDefault();

    if (draggedColumnId === null || draggedColumnId === targetColumnId) {
      return;
    }

    const draggedIndex = columns.findIndex((col) => col.id === draggedColumnId);
    const targetIndex = columns.findIndex((col) => col.id === targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Create new array with reordered columns
    const newColumns = [...columns];
    const [draggedColumn] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedColumn);

    setColumns(newColumns);
    setDragOverColumnId(null);
  };

  const handlePreview = () => {
    const config: CSVConfig = {
      file: fileConfig,
      format: formatConfig,
      columns,
    };
    const preview = generatePreview(config, 10);
    setPreviewContent(preview);
    setShowPreview(true);
  };

  const handleGenerate = async () => {
    if (!validation.isValid) return;

    setIsGenerating(true);
    try {
      const config: CSVConfig = {
        file: fileConfig,
        format: formatConfig,
        columns,
      };
      const result = await generateCSV(config);

      if (result.success) {
        const filename = generateFilename('generated');
        downloadCSV(result.content, filename, formatConfig.encoding);
      } else {
        alert(`Generation failed: ${result.error}`);
      }
    } catch (error) {
      alert(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className='min-h-screen p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-xl p-8 mb-6'>
          <div className='flex items-center gap-3 mb-2'>
            <FileText className='w-8 h-8 text-blue-600' />
            <h1 className='text-3xl font-bold text-gray-800'>CSV Generator</h1>
          </div>
          <p className='text-gray-600'>
            Configure your custom CSV file generation
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Configuration */}
          <div className='lg:col-span-2 space-y-6'>
            {/* File Structure Section */}
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <h2 className='text-xl font-bold text-gray-800 mb-4'>
                File Structure
              </h2>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Total Data Rows
                  </label>
                  <input
                    type='number'
                    value={fileConfig.totalRows}
                    onChange={(e) =>
                      setFileConfig({
                        ...fileConfig,
                        totalRows: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    min='1'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Target File Size (MB)
                    <span className='ml-2 text-xs text-gray-500'>Optional</span>
                  </label>
                  <input
                    type='number'
                    value={fileConfig.targetFileSize || ''}
                    onChange={(e) =>
                      setFileConfig({
                        ...fileConfig,
                        targetFileSize: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder='Optional'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    min='0'
                    step='0.1'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Header Lines
                  </label>
                  <input
                    type='number'
                    value={fileConfig.headerLines}
                    onChange={(e) =>
                      setFileConfig({
                        ...fileConfig,
                        headerLines: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    min='0'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Footer Lines
                  </label>
                  <input
                    type='number'
                    value={fileConfig.footerLines}
                    onChange={(e) =>
                      setFileConfig({
                        ...fileConfig,
                        footerLines: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    min='0'
                  />
                </div>
              </div>
            </div>

            {/* CSV Format Section */}
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <h2 className='text-xl font-bold text-gray-800 mb-4'>
                CSV Format
              </h2>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Delimiter
                  </label>
                  <select
                    value={formatConfig.delimiter}
                    onChange={(e) =>
                      setFormatConfig({
                        ...formatConfig,
                        delimiter: e.target.value as Delimiter,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {Object.entries(DELIMITER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Quote Character
                  </label>
                  <select
                    value={formatConfig.quoteChar}
                    onChange={(e) =>
                      setFormatConfig({
                        ...formatConfig,
                        quoteChar: e.target.value as QuoteChar,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {Object.entries(QUOTE_CHAR_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='flex items-center gap-2'>
                      Line Ending
                      <div className='group relative'>
                        <Info className='w-4 h-4 text-gray-400 cursor-help' />
                        <div className='invisible group-hover:visible absolute left-0 top-6 z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg'>
                          Choose the line ending format: LF (Unix/Mac), CRLF
                          (Windows), or CR (old Mac)
                        </div>
                      </div>
                    </span>
                  </label>
                  <select
                    value={formatConfig.lineEnding}
                    onChange={(e) =>
                      setFormatConfig({
                        ...formatConfig,
                        lineEnding: e.target.value as LineEnding,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {Object.entries(LINE_ENDING_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Encoding
                  </label>
                  <select
                    value={formatConfig.encoding}
                    onChange={(e) =>
                      setFormatConfig({
                        ...formatConfig,
                        encoding: e.target.value as Encoding,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {Object.entries(ENCODING_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='mt-4'>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={formatConfig.quoteAll}
                    onChange={(e) =>
                      setFormatConfig({
                        ...formatConfig,
                        quoteAll: e.target.checked,
                      })
                    }
                    className='w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700'>
                    Quote all fields
                  </span>
                  <div className='group relative'>
                    <Info className='w-4 h-4 text-gray-400 cursor-help' />
                    <div className='invisible group-hover:visible absolute left-0 top-6 z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg'>
                      When enabled, all fields will be wrapped in quotes.
                      Otherwise, only fields containing special characters
                      (delimiters, quotes, newlines) will be quoted.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Column Configuration Section */}
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-bold text-gray-800'>Columns</h2>
                <button
                  onClick={handleAddColumn}
                  className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                >
                  <Plus className='w-4 h-4' />
                  Add Column
                </button>
              </div>
              <div className='space-y-3'>
                {columns.map((column) => (
                  <div
                    key={column.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                    className={`flex gap-3 items-center transition-all duration-200 ${
                      dragOverColumnId === column.id &&
                      draggedColumnId !== column.id
                        ? 'border-t-2 border-blue-500 pt-3'
                        : ''
                    } ${draggedColumnId === column.id ? 'opacity-50' : ''}`}
                  >
                    <div className='cursor-move p-2 hover:bg-gray-100 rounded-md transition-colors'>
                      <GripVertical className='w-5 h-5 text-gray-400' />
                    </div>
                    <input
                      type='text'
                      value={column.name}
                      onChange={(e) =>
                        handleColumnChange(column.id, 'name', e.target.value)
                      }
                      placeholder='Column name'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                    <select
                      value={column.dataType}
                      onChange={(e) =>
                        handleColumnChange(
                          column.id,
                          'dataType',
                          e.target.value as DataType
                        )
                      }
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      {Object.entries(DATA_TYPE_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                    <button
                      onClick={() => handleRemoveColumn(column.id)}
                      className='p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors'
                      disabled={columns.length === 1}
                    >
                      <Trash2 className='w-5 h-5' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className='space-y-6'>
            {/* Summary */}
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <h2 className='text-xl font-bold text-gray-800 mb-4'>Summary</h2>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Rows:</span>
                  <span className='font-semibold'>
                    {fileConfig.totalRows.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Columns:</span>
                  <span className='font-semibold'>{columns.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Est. Size:</span>
                  <span className='font-semibold'>
                    {estimatedSize?.formatted || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {validation.errors.length > 0 && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <h3 className='text-sm font-semibold text-red-800 mb-2'>
                  Errors
                </h3>
                <ul className='text-sm text-red-700 space-y-1'>
                  {validation.errors.map((error, idx) => (
                    <li key={idx}>• {error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className='space-y-3'>
              <button
                onClick={handlePreview}
                disabled={!validation.isValid}
                className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
              >
                <Eye className='w-5 h-5' />
                Preview
              </button>
              <button
                onClick={handleGenerate}
                disabled={!validation.isValid || isGenerating}
                className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
              >
                <Download className='w-5 h-5' />
                {isGenerating ? 'Generating...' : 'Generate & Download'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col'>
              <div className='flex items-center justify-between p-6 border-b'>
                <h2 className='text-xl font-bold text-gray-800'>CSV Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  ✕
                </button>
              </div>
              <div className='flex-1 overflow-auto p-6'>
                <pre className='text-xs font-mono bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto'>
                  {previewContent}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
