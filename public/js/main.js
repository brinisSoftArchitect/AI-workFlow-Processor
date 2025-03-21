document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const projectNameInput = document.getElementById('projectName');
  const saveProjectBtn = document.getElementById('saveProjectBtn');
  const openProjectBtn = document.getElementById('openProjectBtn');
  const promptArea = document.getElementById('promptArea');
  const resultArea = document.getElementById('resultArea');
  const errorArea = document.getElementById('errorArea');
  const loadTemplateBtn = document.getElementById('loadTemplateBtn');
  const savePromptBtn = document.getElementById('savePromptBtn');
  const validateJsonBtn = document.getElementById('validateJsonBtn');
  const saveResultBtn = document.getElementById('saveResultBtn');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const copyResultBtn = document.getElementById('copyResultBtn');
  const copyErrorBtn = document.getElementById('copyErrorBtn');
  const loadErrorsBtn = document.getElementById('loadErrorsBtn');
  const executeBtn = document.getElementById('executeBtn');
  const statusDiv = document.getElementById('status');
  
  // Get the file buttons from the DOM (they're already in the HTML)
  const showFilesBtn = document.getElementById('showFilesBtn');
  const showContentsBtn = document.getElementById('showContentsBtn');

  // Load current project on page load
  loadCurrentProject();

  // Save project name
  saveProjectBtn.addEventListener('click', async function() {
    const projectName = projectNameInput.value.trim();
    if (!projectName) {
      showStatus('Please enter a project name', 'error');
      return;
    }

    try {
      const response = await fetch('/api/save-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectName })
      });

      const data = await response.json();
      if (data.success) {
        showStatus(`Project "${projectName}" saved successfully!`, 'success');
        document.title = `AI Workflow Manager - ${projectName}`;
      } else {
        showStatus(data.message || 'Failed to save project', 'error');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      showStatus('Error saving project. Please check the console for details.', 'error');
    }
  });
  openProjectBtn.addEventListener('click', async function() {
    const projectName = projectNameInput.value.trim();
    if (!projectName) {
      showStatus('Please enter a project name', 'error');
      return;
    }
  
    try {
      const response = await fetch('/api/open-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectName })
      });
  
      const data = await response.json();
      if (data.success) {
        showStatus(`Project "${projectName}" opened in file explorer`, 'success');
      } else {
        showStatus(data.message || 'Failed to open project', 'error');
      }
    } catch (error) {
      console.error('Error opening project:', error);
      showStatus('Error opening project. Please check the console for details.', 'error');
    }
  });
  // Load template functionality
  loadTemplateBtn.addEventListener('click', async function() {
    try {
      const projectName = projectNameInput.value.trim();
      // Pass project name to the API if available
      const url = projectName ? 
        `/api/load-template?project=${encodeURIComponent(projectName)}` : 
        '/api/load-template';
      
      showStatus('Loading template...', 'info');
        
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        promptArea.value = data.template;
        showStatus('Template loaded successfully!', 'success');
      } else {
        showStatus(data.message || 'Failed to load template', 'error');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      showStatus('Error loading template. Please check the console for details.', 'error');
    }
  });

  // Save prompt functionality
  savePromptBtn.addEventListener('click', async function() {
    const prompt = promptArea.value.trim();
    if (!prompt) {
      showStatus('Please enter a prompt to save', 'error');
      return;
    }

    try {
      const response = await fetch('/api/save-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt,
          projectName: projectNameInput.value.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        showStatus('Prompt saved successfully!', 'success');
      } else {
        showStatus(data.message || 'Failed to save prompt', 'error');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      showStatus('Error saving prompt. Please check the console for details.', 'error');
    }
  });

  // Validate JSON functionality
  validateJsonBtn.addEventListener('click', function() {
    const text = resultArea.value.trim();
    if (!text) {
      showStatus('Please paste an AI response to validate', 'error');
      return;
    }

    try {
      JSON.parse(text);
      showStatus('Valid JSON format!', 'success');
    } catch (error) {
      showStatus(`Invalid JSON: ${error.message} (But our backend can still try to fix this)`, 'error');
    }
  });

  // Save AI result functionality
  saveResultBtn.addEventListener('click', async function() {
    const result = resultArea.value.trim();
    if (!result) {
      showStatus('Please paste an AI response to save', 'error');
      return;
    }

    try {
      // Validate JSON before saving
      JSON.parse(result);
      
      const response = await fetch('/api/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          result,
          projectName: projectNameInput.value.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        showStatus('AI result saved successfully!', 'success');
      } else {
        showStatus(data.message || 'Failed to save AI result', 'error');
      }
    } catch (error) {
      console.error('Error saving AI result:', error);
      if (error instanceof SyntaxError) {
        showStatus('Invalid JSON format. Please validate before saving.', 'error');
      } else {
        showStatus('Error saving AI result. Please check the console for details.', 'error');
      }
    }
  });

  // Execute build functionality
  executeBtn.addEventListener('click', async function() {
    const result = resultArea.value.trim();
    const projectName = projectNameInput.value.trim();
    
    if (!result) {
      showStatus('Please paste an AI response to execute', 'error');
      return;
    }
    
    if (!projectName) {
      showStatus('Warning: No project name specified. Using default.', 'error');
      // Wait for the user to see the warning
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    try {
      // Instead of validating JSON, we'll let the backend handle it with its repair tools
      showStatus('Executing build process...', 'success');
      errorArea.value = "";
      const response = await fetch('/api/execute-build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          result,
          projectName
        })
      });

      const data = await response.json();
      if (data.success) {
        showStatus(data.message, 'success');
        
        // Display errors if any
        if (data.errors) {
          let errorDisplay = '';
          
          // Format command errors
          if (data.errors.commandsError) {
            errorDisplay += '=== COMMAND ERRORS ===\n';
            errorDisplay += data.errors.commandsError + '\n\n';
          }
          
          // Format test report errors
          if (data.errors.testReportString) {
            errorDisplay += '=== TEST REPORT ===\n';
            errorDisplay += data.errors.testReportString + '\n\n';
          }
          
          // Format general errors
          if (data.errors.generalErrors) {
            errorDisplay += '=== GENERAL ERRORS ===\n';
            errorDisplay += typeof data.errors.generalErrors === 'string' 
              ? data.errors.generalErrors 
              : JSON.stringify(data.errors.generalErrors, null, 2);
            errorDisplay += '\n\n';
          }
          
          // Format command output
          if (data.errors.output) {
            errorDisplay += '=== COMMAND OUTPUT ===\n';
            errorDisplay += typeof data.errors.output === 'string'
              ? data.errors.output
              : JSON.stringify(data.errors.output, null, 2);
          }
          
          errorArea.value = errorDisplay || 'No specific error details available.';
        } else {
          errorArea.value = 'Build completed successfully with no errors.';
        }
      } else {
        showStatus(data.message || 'Failed to execute build', 'error');
        if (data.errors) {
          let errorDisplay = '';
          
          // Format any available error types
          Object.entries(data.errors).forEach(([key, value]) => {
            if (value) {
              errorDisplay += `=== ${key.toUpperCase()} ===\n`;
              errorDisplay += typeof value === 'string'
                ? value 
                : JSON.stringify(value, null, 2);
              errorDisplay += '\n\n';
            }
          });
          
          errorArea.value = errorDisplay || 'Build failed, but no specific error details are available.';
        }
      }
    } catch (error) {
      console.error('Error executing build:', error);
      if (error instanceof SyntaxError) {
        showStatus('Invalid JSON format. Please validate before executing.', 'error');
      } else {
        showStatus('Error executing build. Please check the console for details.', 'error');
      }
    }
  });

  // Load error logs functionality
  loadErrorsBtn.addEventListener('click', async function() {
    const projectName = projectNameInput.value.trim();
    if (!projectName) {
      showStatus('Please enter a project name to load error logs', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/error-logs/${projectName}`);
      const data = await response.json();
      
      if (data.success) {
        errorArea.value = data.logs;
        showStatus('Error logs loaded successfully!', 'success');
      } else {
        showStatus(data.message || 'Failed to load error logs', 'error');
      }
    } catch (error) {
      console.error('Error loading error logs:', error);
      showStatus('Error loading error logs. Please check the console for details.', 'error');
    }
  });

  // Copy prompt to clipboard
  copyPromptBtn.addEventListener('click', function() {
    copyToClipboard(promptArea);
  });

  // Copy result to clipboard
  copyResultBtn.addEventListener('click', function() {
    copyToClipboard(resultArea);
  });

  // Copy errors to clipboard
  copyErrorBtn.addEventListener('click', function() {
    copyToClipboard(errorArea);
  });

  // Show file paths functionality
  if (showFilesBtn) {
    showFilesBtn.addEventListener('click', async function() {
      const projectName = projectNameInput.value.trim();
      
      try {
        showStatus('Loading file paths...', 'info');
        
        // Add error handling and loading indicators
        const url = projectName ? 
          `/api/file-paths?project=${encodeURIComponent(projectName)}` : 
          '/api/file-paths';
          
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          // Append file paths to prompt area
          const filePathsText = '=== FILE PATHS ===\n' + 
            JSON.stringify(data.filePaths, null, 2) + '\n\n';
          
          // Add to current prompt text
          const currentText = promptArea.value;
          promptArea.value = filePathsText + currentText;
          
          showStatus('File paths added to prompt!', 'success');
        } else {
          showStatus(data.message || 'Failed to get file paths', 'error');
        }
      } catch (error) {
        console.error('Error getting file paths:', error);
        showStatus('Error getting file paths. Please check the console for details.', 'error');
      }
    });
  } else {
    console.error("showFilesBtn not found in the DOM");
  }

  // Show file contents functionality
  if (showContentsBtn) {
    showContentsBtn.addEventListener('click', async function() {
      const projectName = projectNameInput.value.trim();
      
      try {
        showStatus('Loading file contents...', 'info');
        
        // Add error handling and loading indicators
        const url = projectName ? 
          `/api/file-contents?project=${encodeURIComponent(projectName)}` : 
          '/api/file-contents';
          
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          // Append file contents to prompt area
          let fileContentsText = '=== FILE CONTENTS ===\n' + data.contents;
          
          // Only add remaining files section if it exists
          if (data.remainingFiles) {
            fileContentsText += '\n\n=== REMAINING FILES ===\n' +
              JSON.stringify(data.remainingFiles, null, 2);
          }
          
          fileContentsText += '\n\n';
          
          // Add to current prompt text
          const currentText = promptArea.value;
          promptArea.value = fileContentsText + currentText;
          
          showStatus('File contents added to prompt!', 'success');
        } else {
          showStatus(data.message || 'Failed to get file contents', 'error');
        }
      } catch (error) {
        console.error('Error getting file contents:', error);
        showStatus('Error getting file contents. Please check the console for details.', 'error');
      }
    });
  } else {
    console.error("showContentsBtn not found in the DOM");
  }

  // Add event listener for the new JSON template button
  const loadJsonTemplateBtn = document.getElementById('loadJsonTemplateBtn');
  if (loadJsonTemplateBtn) {
    loadJsonTemplateBtn.addEventListener('click', function() {
      loadSpecificTemplate('completeJson.md');
    });
  }

  // Helper functions
  async function loadCurrentProject() {
    try {
      const response = await fetch('/api/current-project');
      const data = await response.json();
      
      if (data.success && data.projectName) {
        projectNameInput.value = data.projectName;
        document.title = `AI Workflow Manager - ${data.projectName}`;
      }
    } catch (error) {
      console.error('Error loading current project:', error);
    }
  }

  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = '';
    statusDiv.classList.add(type);
    statusDiv.style.display = 'block';
    
    // Clear status after 5 seconds
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = '';
    }, 5000);
  }

  function copyToClipboard(textElement) {
    textElement.select();
    textElement.setSelectionRange(0, 99999); // For mobile devices
    
    try {
      navigator.clipboard.writeText(textElement.value)
        .then(() => {
          showStatus('Text copied to clipboard!', 'success');
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
          // Fallback for older browsers
          document.execCommand('copy');
          showStatus('Text copied to clipboard!', 'success');
        });
    } catch (err) {
      console.error('Clipboard API not available: ', err);
      // Fallback
      document.execCommand('copy');
      showStatus('Text copied to clipboard!', 'success');
    }
  }
  
  // Function to load a specific template
  function loadSpecificTemplate(templateName) {
    const projectName = document.getElementById('projectName').value.trim();
    
    showStatus('Loading template...', 'info');
    
    // Make API request to load the specific template
    let url = `/api/load-specific-template?template=${encodeURIComponent(templateName)}`;
    
    // Add project parameter if available
    if (projectName) {
      url += `&project=${encodeURIComponent(projectName)}`;
    }
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          document.getElementById('promptArea').value = data.template;
          showStatus('Template loaded successfully!', 'success');
        } else {
          showStatus('Failed to load template: ' + data.message, 'error');
        }
      })
      .catch(error => {
        console.error('Error loading template:', error);
        showStatus('Error loading template. See console for details.', 'error');
      });
  }
});