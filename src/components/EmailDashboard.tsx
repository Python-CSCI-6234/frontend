import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Email } from '@/types/api';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import sanitizeHtml from 'sanitize-html';
import Image from 'next/image';
import { useGmailLabels } from '@/hooks/useGmailLabels';

export default function EmailDashboard() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailCount, setEmailCount] = useState<number>(10);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const queryClient = useQueryClient();
  
  // Get labels
  const { 
    labels, 
    isLoading: labelsLoading 
  } = useGmailLabels();

  // Use the direct Gmail API route instead of the slow API
  const { data: emails, isLoading: emailsLoading, refetch } = useQuery<{ emails: Email[] }>({
    queryKey: ['gmailEmails', emailCount],
    queryFn: async () => {
      const response = await fetch(`/api/emails/fetch?count=${emailCount}`);
      if (!response.ok) {
        throw new Error('Failed to fetch emails from Gmail');
      }
      return response.json();
    },
  });

  // Apply label mutation
  const applyLabelMutation = useMutation({
    mutationFn: async ({ emailId, labelIds }: { emailId: string; labelIds: string[] }) => {
      const response = await fetch('/api/emails/labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailId, labelIds }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply labels');
      }
      
      return response.json();
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gmailEmails'] });
      setSelectedLabelIds([]);
      
      const newEmailsData = await refetch();
      
      if (selectedEmail && selectedEmail.id === variables.emailId && newEmailsData.data?.emails) {
        const updatedEmail = newEmailsData.data.emails.find(email => email.id === variables.emailId);
        if (updatedEmail) {
          setSelectedEmail(updatedEmail);
        }
      }
    },
  });

  // Remove label mutation
  const removeLabelMutation = useMutation({
    mutationFn: async ({ emailId, labelIds }: { emailId: string; labelIds: string[] }) => {
      const response = await fetch('/api/emails/labels', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailId, labelIds }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove labels');
      }
      
      return response.json();
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gmailEmails'] });
      
      const newEmailsData = await refetch();
      
      if (selectedEmail && selectedEmail.id === variables.emailId && newEmailsData.data?.emails) {
        const updatedEmail = newEmailsData.data.emails.find(email => email.id === variables.emailId);
        if (updatedEmail) {
          setSelectedEmail(updatedEmail);
        }
      }
    },
  });

  // Function to handle email count change
  const handleCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEmailCount(Number(e.target.value));
    refetch();
  };

  // Function to determine if content is primarily HTML
  const isHtmlContent = (content: string): boolean => {
    return /<[a-z][\s\S]*>/i.test(content);
  };

  // Sanitize HTML content
  const sanitizeContent = (content: string): string => {
    return sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'height', 'width', 'class'],
        a: ['href', 'name', 'target'],
        '*': ['class', 'style']
      },
      allowedStyles: {
        '*': {
          'color': [/.*/],
          'text-align': [/.*/],
          'font-size': [/.*/],
          'margin': [/.*/],
          'padding': [/.*/]
        }
      }
    });
  };

  // Handle label selection
  const handleLabelSelection = (labelId: string) => {
    setSelectedLabelIds(prev => {
      if (prev.includes(labelId)) {
        return prev.filter(id => id !== labelId);
      }
      return [...prev, labelId];
    });
  };

  // Apply selected labels to the current email
  const applySelectedLabels = () => {
    if (selectedEmail && selectedLabelIds.length > 0) {
      applyLabelMutation.mutate({
        emailId: selectedEmail.id,
        labelIds: selectedLabelIds
      });
    }
  };

  // Remove a label from the current email
  const removeLabel = (labelId: string) => {
    if (selectedEmail) {
      removeLabelMutation.mutate({
        emailId: selectedEmail.id,
        labelIds: [labelId]
      });
    }
  };

  // Render email content based on its format
  const renderEmailContent = (content: string) => {
    if (isHtmlContent(content)) {
      return (
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeContent(content) }} 
        />
      );
    } else {
      return (
        <div className="prose max-w-none">
          <ReactMarkdown
            components={{
              code: ({ node, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                return !node?.position?.start?.offset && match ? (
                  <SyntaxHighlighter
                    // @ts-expect-error - Type definitions for react-syntax-highlighter are not accurate
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              img: (props) => {
                const src = props.src || '';
                const alt = props.alt || '';
                const width = typeof props.width === 'number' ? props.width : 500;
                const height = typeof props.height === 'number' ? props.height : 300;
                
                return (
                  <div className="relative my-4" style={{ maxWidth: '100%' }}>
                    <Image
                      src={src}
                      alt={alt}
                      width={width}
                      height={height}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    }
  };

  // Function to get label by ID
  const getLabelById = (id: string) => {
    return labels.find(label => label.id === id);
  };

  // Function to render email labels
  const renderEmailLabels = (email: Email) => {
    if (!email.labelIds || email.labelIds.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {email.labelIds.map(labelId => {
          const label = getLabelById(labelId);
          if (!label) return null;
          
          return (
            <span 
              key={labelId}
              className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1"
              style={{
                backgroundColor: label.color?.backgroundColor || '#e0e0e0',
                color: label.color?.textColor || '#000000'
              }}
            >
              {label.name}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeLabel(labelId);
                }}
                className="w-3 h-3 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs hover:bg-gray-900 cursor-pointer"
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
    );
  };

  // Toggle compact view
  const toggleCompactView = () => {
    setIsCompact(!isCompact);
  };

  const layoutClasses = isCompact 
    ? "grid grid-cols-1 gap-4" 
    : "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4";

  const emailListClasses = isCompact
    ? "bg-white p-3 rounded-lg shadow flex flex-col md:col-span-1"
    : "bg-white p-4 rounded-lg shadow md:col-span-1 flex flex-col";

  const emailContentClasses = isCompact
    ? "bg-white p-3 rounded-lg shadow overflow-auto max-h-[50vh]"
    : "bg-white p-4 rounded-lg shadow md:col-span-2 overflow-auto max-h-[80vh]";

  return (
    <div className="p-2 sm:p-4 max-w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Email Dashboard</h1>
        <button 
          onClick={toggleCompactView} 
          className="text-xs sm:text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          {isCompact ? 'Expanded View' : 'Compact View'}
        </button>
      </div>
      
      <div className={layoutClasses}>
        <div className={emailListClasses}>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Recent Emails</h2>
            <div className="flex items-center">
              <label htmlFor="emailCount" className="mr-1 sm:mr-2 text-xs sm:text-sm">Show:</label>
              <select 
                id="emailCount" 
                value={emailCount} 
                onChange={handleCountChange}
                className="border rounded p-1 text-xs sm:text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          <div className={`overflow-y-auto flex-grow ${isCompact ? "max-h-[30vh]" : "max-h-[calc(80vh-80px)]"}`}>
            {emailsLoading ? (
              <p>Loading emails...</p>
            ) : (
              <>
                {emails?.emails && emails.emails.length > 0 ? (
                  <ul className="space-y-2">
                    {emails.emails.map((email) => (
                      <li 
                        key={email.id} 
                        className={`border-b pb-2 cursor-pointer hover:bg-gray-100 p-2 rounded ${selectedEmail?.id === email.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedEmail(email)}
                      >
                        <h3 className="font-medium text-sm sm:text-base">{email.subject}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{email.from}</p>
                        <p className="text-xs text-gray-500">{email.date}</p>
                        {renderEmailLabels(email)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No emails found</p>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className={emailContentClasses}>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Email Content</h2>
          {selectedEmail ? (
            <div>
              <div className="mb-3 sm:mb-4 border-b pb-2">
                <h3 className="text-base sm:text-lg font-bold">{selectedEmail.subject}</h3>
                <p className="text-xs sm:text-sm text-gray-600">From: {selectedEmail.from}</p>
                <p className="text-xs sm:text-sm text-gray-500">Date: {selectedEmail.date}</p>
                
                <div className="mt-2 sm:mt-3 border-t pt-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedEmail.labelIds?.map(labelId => {
                      const label = getLabelById(labelId);
                      if (!label) return null;
                      
                      return (
                        <span 
                          key={labelId}
                          className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1"
                          style={{
                            backgroundColor: label.color?.backgroundColor || '#e0e0e0',
                            color: label.color?.textColor || '#000000'
                          }}
                        >
                          {label.name}
                          <button 
                            onClick={() => removeLabel(labelId)}
                            className="w-3 h-3 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs hover:bg-gray-900 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  
                  {!isCompact && (
                    <div className="mt-2">
                      <div className="text-xs sm:text-sm font-medium mb-1">Apply Labels:</div>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                        {labelsLoading ? (
                          <p className="text-xs sm:text-sm">Loading labels...</p>
                        ) : labels.length > 0 ? (
                          <>
                            {labels.map(label => (
                              <label 
                                key={label.id}
                                className={`
                                  px-2 py-1 text-xs border rounded-full flex items-center gap-1 cursor-pointer
                                  ${selectedLabelIds.includes(label.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                                `}
                              >
                                <input 
                                  type="checkbox"
                                  className="sr-only"
                                  checked={selectedLabelIds.includes(label.id)}
                                  onChange={() => handleLabelSelection(label.id)}
                                />
                                <span 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: label.color?.backgroundColor || '#e0e0e0' }}
                                ></span>
                                {label.name}
                              </label>
                            ))}
                          </>
                        ) : (
                          <p className="text-xs sm:text-sm">No labels available</p>
                        )}
                      </div>
                      <button
                        onClick={applySelectedLabels}
                        disabled={selectedLabelIds.length === 0 || applyLabelMutation.isPending}
                        className={`
                          px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors
                          ${selectedLabelIds.length === 0 || applyLabelMutation.isPending 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'}
                        `}
                      >
                        {applyLabelMutation.isPending ? 'Applying...' : 'Apply Selected Labels'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm">
                {renderEmailContent(selectedEmail.body)}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Select an email to view its content</p>
          )}
        </div>
      </div>
      
      {isCompact && selectedEmail && (
        <div className="mt-3 p-3 bg-white rounded-lg shadow">
          <div className="text-xs sm:text-sm font-medium mb-1">Manage Labels:</div>
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
            {labelsLoading ? (
              <p className="text-xs">Loading labels...</p>
            ) : labels.length > 0 ? (
              <>
                {labels.map(label => (
                  <label 
                    key={label.id}
                    className={`
                      px-2 py-0.5 text-xs border rounded-full flex items-center gap-1 cursor-pointer
                      ${selectedLabelIds.includes(label.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    `}
                  >
                    <input 
                      type="checkbox"
                      className="sr-only"
                      checked={selectedLabelIds.includes(label.id)}
                      onChange={() => handleLabelSelection(label.id)}
                    />
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: label.color?.backgroundColor || '#e0e0e0' }}
                    ></span>
                    {label.name}
                  </label>
                ))}
              </>
            ) : (
              <p className="text-xs">No labels available</p>
            )}
          </div>
          <button
            onClick={applySelectedLabels}
            disabled={selectedLabelIds.length === 0 || applyLabelMutation.isPending}
            className={`
              px-2 py-1 text-xs rounded-md transition-colors
              ${selectedLabelIds.length === 0 || applyLabelMutation.isPending 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'}
            `}
          >
            {applyLabelMutation.isPending ? 'Applying...' : 'Apply Selected Labels'}
          </button>
        </div>
      )}
      
      <div className="mt-3 flex flex-wrap gap-2">
        <button 
          className="px-3 py-1 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 rounded"
          onClick={() => setSelectedEmail(null)}
        >
          Back to Email List
        </button>
      </div>
    </div>
  );
} 