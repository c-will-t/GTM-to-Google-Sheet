function checkLiveVersion() {
    //**TODO: Update below values */
    //Account ID
    const accountId = 'YOUR_GTM_ACCOUNT_ID'; //**TODO:replace with real GTM account ID**
    //Container ID
    const containerId = 'YOUR_GTM_CONTAINER_ID'; //**TODO:replace with real GTM container ID**
    //Spreadsheet ID
    const ssId = 'YOUR_SPREADSHEET_ID'; //**TODO: replace with real spreadsheet ID */
  
    //Get SS details
    //Get Spreadsheet
    const ss = SpreadsheetApp.openById(ssId);
    //Get details sheet
    const dSheet = ss.getSheetByName('Container Details');
    //Get last version logged
    const lastVersionRange = dSheet.getRange('C5');
    const lastVersion = lastVersionRange.getValue();
    //Get last refresh time range
    const lastRefresh = dSheet.getRange('C6');
  
    //Get container details
    //Concat container path
    const parent = 'accounts/' + accountId + '/containers/' + containerId;
    //Get live version
    const liveVersion = TagManager.Accounts.Containers.Versions.live(parent);
    //Get version ID
    const versionId = liveVersion.containerVersionId;
    //Get Account Name
    const account = TagManager.Accounts.get(parent);
    //Get Container name and ID
    const container = TagManager.Accounts.Containers.get(parent);
    const containerName = container.name;
    const containerPubId = container.publicId;
  
  
    //Check if lastVersion matches versionId
    if(lastVersion != versionId) {
      mapGtmContainerCopy(ss,liveVersion);
      lastVersionRange.setValue(versionId);
    }
      //Set container details
      //Get dSheet details
      const containerIdRange = dSheet.getRange('C4');
  
      containerIdRange.setValue(containerPubId);
      lastRefresh.setValue(Date());
  };


  function mapGtmContainerCopy(ss,liveVersion) {
    //Get tag sheet
    const tagSheet = ss.getSheetByName('Tags');//*TODO: update name of sheet where tags will go, if different from template*/
    const triggerSheet = ss.getSheetByName('Triggers');//*TODO: update name of sheet where triggers will go, if different from template*/
    const variableSheet = ss.getSheetByName('Variables');//*TODO: update name of sheet where variables will go, if different from template*/
    //Get ranges for refresh messages
    const tagRef = tagSheet.getRange('A3');
    const triggerRef = triggerSheet.getRange('A3');
    const varRef = variableSheet.getRange('A3');
  
  
    //Map notes to tag IDs
    const tagNoteDataRange = tagSheet.getDataRange();
    const tagNoteValues = tagNoteDataRange.getValues();
    const tagNoteArray = {};
    for(var i = 0; i < tagNoteValues.length; i++) {
      const oldTagId = tagNoteValues[i][0];
      const existingTagNotes = tagNoteValues[i][7]; //Should match index number of column containing custom notes
  
      if(existingTagNotes) {
        tagNoteArray[oldTagId] = existingTagNotes;
      }
    };
  
      //Map notes to trigger IDs
    const triggerNoteDataRange = triggerSheet.getDataRange();
    const triggerNoteValues = triggerNoteDataRange.getValues();
    const triggerNoteArray = {};
    for(var i = 0; i < triggerNoteValues.length; i++) {
      const oldTriggerId = triggerNoteValues[i][0];
      const existingTriggerNotes = triggerNoteValues[i][5]; //Should match index number of column containing custom notes
  
      if(existingTriggerNotes) {
        triggerNoteArray[oldTriggerId] = existingTriggerNotes;
      }
    };
  
      //Map notes to variable IDs
    const variableNoteDataRange = variableSheet.getDataRange();
    const variableNoteValues = variableNoteDataRange.getValues();
    const variableNoteArray = {};
    for(var i = 0; i < variableNoteValues.length; i++) {
      const oldVariableId = variableNoteValues[i][0];
      const existingVariableNotes = variableNoteValues[i][6]; //Should match index number of column containing custom notes
      if(existingVariableNotes) {
        variableNoteArray[oldVariableId] = existingVariableNotes;
      }
    };
    //Clear existing data, set refresh messages
    tagSheet.getRange('A3:I').clearContent();
    triggerSheet.getRange('A3:G').clearContent();
    variableSheet.getRange('A3:H').clearContent();
    tagRef.setValue('Refreshing...');
    triggerRef.setValue('Refreshing...');
    varRef.setValue('Refreshing...');
  
    //Get folder list
    const folders = liveVersion.folder;
    //Get tag list
    const tags = liveVersion.tag;
    //Get trigger list
    const triggers = liveVersion.trigger;
    //Get variable list
    const variables = liveVersion.variable;
    //Get built in variable list
    const builtInVariables = liveVersion.builtInVariable;
  
    // Map trigger names by IDs
    const triggerMap = {};
    triggerMap['2147479553'] = 'All Pages';
    triggerMap['2147479572'] = 'Consent Initialization';
    triggers.forEach(trigger => {
      triggerMap[trigger.triggerId] = trigger.name;
    });
  
    const folderMap = {};
    if(liveVersion.folder) {
      folders.forEach(folder => {
      folderMap[folder.folderId] = folder.name;
    });
    };
  
    const tagTypeFunctionObject = {
      'gaawe': ga4EventDetails,
      'gaawc': ga4ConfigDetails,
      'awct': googleAdsEventDetails,
      'html': htmlDetails,
    };
  
    //Clear tag refresh message
    tagRef.clearContent();
  
    //Gather tag information for each tag and prepare to put in ss
    if (tags) {
    tags.forEach(tag => {
      //Get tag ID
      const tagId = tag.tagId;
      //Get tag name
      const tagName = tag.name;
      //Get tag type
      const tagType = lookupTagTypeName(tag) || 'Custom Template';
      //Get tag folderId
      const tagFolderId = tag.parentFolderId;
      //Map tag folder ID to return name
      const tagFolderName = tagFolderId ? folderMap[tagFolderId] : 'None';
      //Get GTM notes
      const gtmTagNotes = tag.notes || '';
      //Get tag details based on tag type
      const tagTypeFunction = tagTypeFunctionObject[tag.type] ;
      const tagDetails = tagTypeFunction ? tagTypeFunction(tag) : elseTagDetails(tag);
      //Get custom tag notes based on map
      const customTagNotes = tagNoteArray[tagId] || '';
      //Get firing trigger IDs as an array
      const firingTriggerIds = tag.firingTriggerId || [];
      if (firingTriggerIds.length > 0) {
  
        //Set loop through each trigger ID and log the tag name, etc. as a row for each corresponding trigger ID
        firingTriggerIds.forEach(triggerId => {
        const firingTriggerName = triggerMap[triggerId];
          //Set values to log
          const tagValuesToLog = [[tagId,tagName,tagType,tagDetails,triggerId,firingTriggerName,gtmTagNotes,customTagNotes,tagFolderName]];
          //Get start row
          const tagsStartRow = tagSheet.getLastRow() + 1;
          //Get start column
          const tagsStartCol = 1;
          //Log values to sheet
          tagSheet.getRange(tagsStartRow, tagsStartCol, 1, 9).setValues(tagValuesToLog);
        });
      } else {
        // Set trigger values to None and log tags
        const triggerId = 'None';
        const firingTriggerName = 'None';
  
        //Set values to log
          const valuesToLog = [[tagId,tagName,tagType,tagDetails,triggerId,firingTriggerName,gtmTagNotes,customTagNotes,tagFolderName]];
          //Get start row
          const tagsStartRow = tagSheet.getLastRow() + 1;
          //Get start column
          const tagsStartCol = 1;
          //Log values to sheet
          tagSheet.getRange(tagsStartRow, tagsStartCol, 1, 9).setValues(valuesToLog);
        }
    });
    } else {
      console.log('no tags found');
    };
  
    //Clear trigger refresh message
    triggerRef.clearContent();
  
    //Loop through triggers to gather information and log in triggers sheet
    if (triggers) {
    triggers.forEach(trigger => {
      // Get trigger ID
      const triggerId = trigger.triggerId;
      // Get trigger name
      const triggerName = trigger.name;
      // Get trigger type
      const triggerType = trigger.type;
      // Get trigger notes
      const triggerNote = trigger.notes || 'None';
      // Get trigger folder
      const triggerFolderId = trigger.parentFolderId;
      //Map tag folder ID to return name
      const triggerFolderName = triggerFolderId ? folderMap[triggerFolderId] : 'None';
      // Get trigger filters
      const triggerFilters = trigger.filter || [];
      // Get custom notes
      const customTriggerNotes = triggerNoteArray[triggerId] || '';
      // Set array for trigger filters
      const filterArray = [];
      // If filters exist, Get all trigger conditions and concat to a string, else return nothing
      if (triggerFilters.length > 0) {
        // Loop through filters and collect type and arguments
        trigger.filter.forEach(filter => {
          // Get filter type
          const filterType = filter.type;
          // Get arguments
          const arg0 = filter.parameter.find(param => param.key === 'arg0').value;
          const arg1 = filter.parameter.find(param => param.key === 'arg1').value;
          // Compile filter details
          const filterDetails = arg0 + ' ' + filterType + ' ' + arg1;
          // Push values to Array
          filterArray.push(filterDetails);
         });
        // join triggerr conditions as a string
        const joinedConditions = filterArray.join('\n');
        // Set trigger values
        const triggerValuesToLog = [[triggerId,triggerName,triggerType,joinedConditions,triggerNote,customTriggerNotes,triggerFolderName]];
        // Get log ranges and log triggers
        const triggerStartRow = triggerSheet.getLastRow() + 1;
        const triggerStartCol = 1;
        triggerSheet.getRange(triggerStartRow, triggerStartCol, 1, 7).setValues(triggerValuesToLog);
      } else {
        const triggerValuesToLog = [[triggerId,triggerName,triggerType,'None',triggerNote,customTriggerNotes,triggerFolderName]];
        const triggerStartRow = triggerSheet.getLastRow() + 1;
        const triggerStartCol = 1;
        triggerSheet.getRange(triggerStartRow, triggerStartCol, 1, 7).setValues(triggerValuesToLog);
    }
  });
    } else { 
      console.log('no triggers found');
    };
  
  //Clear variables refresh message
  varRef.clearContent();
  
  //loop through variables and log to sheet
  if (variables) {
    variables.forEach(variable => {
      const variableId = variable.variableId;
      const variableName = variable.name;
      const variableType = lookupVariableTypeName(variable) || 'Unknown Variable Type';
      const variableNote = variable.notes || '';
      // Get Folder name
      const variableFolderId = variable.parentFolderId;
      //Map tag folder ID to return name
      const variableFolderName = variableFolderId ? folderMap[variableFolderId] : 'None';
      const customVariableNotes = variableNoteArray[variableId] || '';
      let variableDetails = '';
      //If variable has parameters, get parameters and execute next IF
      if(variable.parameter) {
        variable.parameter.forEach(param => {
            if (param.type === 'template') {
              const key = param.key;
              const value = param.value;
              variableDetails += key + ': ' + value + '\n';
            };
            //if variable type is "list', map list items to variableDetails
            if(variable.type === 'remm' || variable.type === 'smm') {
             variableDetails += '\nLookup Table:\n"input" : "output"\n';
             if(param.list) {
              param.list.forEach(listItem => {
                //If item type is map, get items and loop through to get key values
                const key = listItem.map.find(mapItem => mapItem.key === 'key').value;
                const value = listItem.map.find(mapItem => mapItem.key === 'value').value;
                variableDetails += key + ' : ' + value + '\n';
              });
             }
          }
        });
  
      } else {
        variableDetails = 'None';
      };
      //Get log range
      const variableStartRow = variableSheet.getLastRow() + 1;
      const variableStartCol = 1;
      const variablesToLog = [[variableId,'Custom',variableName,variableType,variableDetails,variableNote,customVariableNotes,variableFolderName]];
      variableSheet.getRange(variableStartRow, variableStartCol, 1, 8).setValues(variablesToLog);
    });
  } else {
    console.log('no variables found');
  };
  
  if (builtInVariables) {
    // Log built in variables
    builtInVariables.forEach(variable => {
      const variableId = variable.type;
      const variableName = variable.name;
      const variableType = variable.type;
      const variableDetails = builtInVariableDetails(variable);
      const variableNotes = '';
      const customVariableNotes = variableNoteArray[variableId] || '';
      const variableStartRow = variableSheet.getLastRow() + 1;
      const variableStartCol = 1;
      const variablesToLog = [[variableType,'Built In',variableName,variableType,variableDetails,variableNotes,customVariableNotes,'NA']];
      variableSheet.getRange(variableStartRow,variableStartCol,1,8).setValues(variablesToLog);
    });
  } else {
    console.log('no built in variables found');
  };
  };

  function htmlDetails(tag) {
    const html = tag.parameter.find(param => param.key === 'html').value;
    return html;
  }
  
  function builtInVariableDetails(builtInVariable) {
    const builtInVariableArray = {
      'clickElement': 'Accesses the gtm.element key in the dataLayer, which is set by Click triggers. This will be a reference to the DOM element where the click occurred.',
  'clickClasses': 'Accesses the gtm.elementClasses key in the dataLayer, which is set by Click triggers. This will be the string value of the classes attribute on the DOM element that was clicked.',
  'clickId': 'Accesses the gtm.elementId key in the dataLayer, which is set by Click triggers. This will be the string value of the id attribute on the DOM element that was clicked.',
  'clickTarget': 'Accesses the gtm.elementTarget key in the dataLayer, which is set by Click triggers.',
  'clickUrl': 'Accesses the gtm.elementUrl key in the dataLayer, which is set by Click triggers.',
  'clickText': 'Accesses the gtm.elementText key in the dataLayer, which is set by Click triggers.',
  'errorMessage': 'Accesses the gtm.errorMessage key in the dataLayer, which is set by JavaScript Error triggers. This will be a string that contains the error message.',
  'errorUrl': 'Accesses the gtm.errorUrl key in the dataLayer, which is set by JavaScript Error triggers. This will be a string that contains the URL where the error occurred.',
  'errorLine': 'Accesses the gtm.errorLine key in the dataLayer, which is set by JavaScript Error triggers. This will be a number of the line in the file where the error occurred.',
  'debugMode': 'Returns true if the container is currently in preview mode.',
  'formClasses': 'Accesses the gtm.elementClasses key in the dataLayer, which is set by Form triggers. This will be the string value of the classes attribute on the form.',
  'formElement': 'Accesses the gtm.element key in the dataLayer, which is set by Form triggers. This will be a reference to the form"s DOM element.',
  'formId': 'Accesses the gtm.elementId key in the dataLayer, which is set by Form triggers. This will be the string value of the id attribute on the form.',
  'formTarget': 'Accesses the gtm.elementTarget key in the dataLayer, which is set by Form triggers.',
  'formText': 'Accesses the gtm.elementText key in the dataLayer, which is set by Form triggers.',
  'formUrl': 'Accesses the gtm.elementUrl key in the dataLayer, which is set by Form triggers.',
  'historySource': 'Accesses the gtm.historyChangeSource key in the dataLayer, which is set by History Change triggers.',
  'newHistoryFragment': 'Accesses the gtm.newUrlFragment key in the dataLayer, which is set by History Change triggers. Will be the string value of the fragment (aka hash) portion of the page"s URL after the history event.',
  'newHistoryState': 'Accesses the gtm.newHistoryState key in the dataLayer, which is set by History Change triggers. Will be the state object that the page pushed onto the history to cause the history event.',
  'oldHistoryFragment': 'Accesses the gtm.oldUrlFragment key in the dataLayer, which is set by History Change triggers. Will be the string value of the fragment (aka hash) portion of the page"s URL before the history event.',
  'oldHistoryState': 'Accesses the gtm.oldHistoryState key in the dataLayer, which is set by History Change triggers. Will be the state object that was active before the history event took place.',
  'pageHostname': 'Provides the hostname portion of the current URL.',
  'pagePath': 'Provides the path portion of the current URL.',
  'pageUrl': 'Provides the full URL of the current page.',
  'referrer': 'Provides the full referrer URL for the current page.',
  'scrollDepthThreshold': 'Accesses the gtm.scrollThreshold key in the dataLayer, which is set by Scroll Depth triggers. This will be a numeric value that indicates the scroll depth that caused the trigger to fire. For percentage thresholds, this will be a numeric value (0-100). For pixels, this will be a numeric value that represents the number of pixels specified as the threshold.',
  'scrollDepthUnits': 'Accesses the gtm.scrollUnits key in the dataLayer, which is set by Scroll Depth triggers. This will be either ‘pixels’ or ‘percent’, that indicates the unit specified for the threshold that caused the trigger to fire.',
  'scrollDirection': 'Accesses the gtm.scrollDirection key in the dataLayer, which is set by Scroll Depth triggers. This will be either ‘vertical’ or ‘horizontal’, that indicates the direction of the threshold that caused the trigger to fire.',
  'containerId': 'Provides the container"s public ID. Example value: GTM-XKCD11',
  'containerVersion': 'Provides the version number of the container, as a string.',
  'environmentName': 'Returns the user-provided name of the current environment, if the container request was made from an environment "Share Preview" link or from an environment snippet. For the built-in environments, it will return "Live", "Latest", or "Now Editing". In all other cases it returns an empty string.',
  'event': 'Accesses the event key in the dataLayer, which is the name of the current dataLayer event (e.g. gtm.js, gtm.dom, gtm.load, or custom event names).',
  'htmlId': 'Allows custom HTML tags to signal if they had succeeded or failed; used with tag sequencing.',
  'randomNumber': 'Returns a random number value.',
  'videoCurrentTime': 'Accesses the gtm.videoCurrentTime key in the dataLayer, which is an integer that represents the time in seconds at which an event occurred in the video.',
  'videoDuration': 'Accesses the gtm.videoDuration key in the dataLayer, which is an integer that represents the total duration of the video in seconds.',
  'videoPercent': 'Accesses the gtm.VideoPercent key in the dataLayer, which is an integer (0-100) that represents the percent of video played at which an event occurred.',
  'videoProvider': 'Accesses the gtm.videoProvider key in the dataLayer, which is set by YouTube Video triggers. This will be the name of the video provider, i.e. "YouTube".',
  'videoStatus': 'Accesses the gtm.videoStatus key in the dataLayer, which is the state of the video when an event was detected, e.g. "play", "pause".',
  'videoTitle': 'Access the gtm.videoTitle key in the dataLayer, which is set by YouTube Video triggers. This will be the title of the video.',
  'videoUrl': 'Access the gtm.videoUrl key in the dataLayer, which is set by YouTube Video triggers. This will be the URL of the video, e.g. ‘https://www.youtube.com/watch?v=gvHcXIF0rTU’.',
  'videoVisible': 'Access the gtm.videoVisible key in the dataLayer, which is set by YouTube Video triggers. This will be set to true if the video is visible in the viewport, and false if it is not (e.g. below the fold or in a background tab).',
  'percentVisible': 'Accesses the gtm.visibleRatio key in the dataLayer, which is set by Element Visibility triggers. This will be a numeric value (0-100) that indicates how much of the selected element is visible when the trigger fires.',
  'onScreenDuration': 'Accesses the gtm.visibleTime key in the dataLayer, which is set by Element Visibility triggers. This will be a numeric value that indicates how many milliseconds the selected element has been visible for when the trigger fires.',
      }
    return builtInVariableArray[builtInVariable.type];
  }
  
  function lookupVariableTypeName(variable) {
    
    const variableTypeArray = {
      'u': 'Variable 1 - Full URL',
      'awec': 'User-Provided Data',
      'gas': 'Google Analytics Settings',
      'f': 'HTTP Referrer',
      'u': 'URL',
      'k': '1st Party Cookie',
      'jsm': 'Custom JavaScript',
      'v': 'Data Layer Variable',
      'j': 'JavaScript Variable',
      'aev': 'Auto-Event Variable',
      'd': 'DOM Element',
      'vis': 'Element Visibility',
      'c': 'Constant',
      'e': 'Custom Event',
      'ev': 'Environment Name',
      'smm': 'Lookup Table',
      'r': 'Random Number',
      'remm': 'RegEx Table',
      'uv': 'Undefined Value',
      'awec': 'User-Provided Data',
      'cid': 'Container ID',
      'ctv': 'Container Version Number',
      'dbg': 'Debug Mode',
    }
    return variableTypeArray[variable.type];
  };
  
  function elseTagDetails(tag) {
    //get tag paramters
    const parameterList = tag.parameter;
    //map parameter details if parameter type is 'template'
    const paramKeyValues = parameterList
      .filter(param => param.type === 'template')
      .map(param => param.key + ': ' + param.value);
    //if template parameters are present, convert them to a string
    if (paramKeyValues.length > 0) {
      return paramKeyValues.join('\n');
    } else {
      return 'None'
    }
  };
  
  function ga4ConfigDetails(tag) {
    const measurementId = tag.parameter.find(param => param.key === 'measurementId').value;
    return 'Measurement ID: ' + measurementId;
  }
  
  function googleAdsEventDetails(tag) {
    const conversionId = tag.parameter.find(param => param.key === 'conversionId').value;
    const conversionLabel = tag.parameter.find(param => param.key === 'conversionLabel').value;
    return 'Conversion ID: ' + conversionId + '\nConversion Label: ' + conversionLabel;
  }
  
  function ga4EventDetails(tag) {
    const eventName = tag.parameter.find(param => param.key === 'eventName').value || 'None';
    const eventParameters = tag.parameter.find(param => param.key === 'eventSettingsTable');
      if (eventParameters && eventParameters.list && eventParameters.list.length > 0) {
        const parameterStrings = eventParameters.list.map(param => {
          const paramName = param.map.find(mapItem => mapItem.key === 'parameter').value;
          const paramValue = param.map.find(maptItem => maptItem.key === 'parameterValue').value;
          return 'Name: ' + paramName + ' | Value: ' + paramValue;
        });
  
        const paramDetails = parameterStrings.join('\n');
        return 'Event Name: ' + eventName + '\n\nEvent Parameters:\n' + paramDetails;
      } else {
        return 'Event Name: ' + eventName + '\n\nEvent Parameters:\n' + 'None';
      };
  };
  
  function lookupTagTypeName(tag) {
    //Lookup table for tagtype names
  const tagTypeArray = {
  'gaawc': 'GA4 Configuration',
  'gaawe': 'GA4 Event',
  'awct': 'Google Ads Conversion Tracking',
  'sp': 'Google Ads Remarketing',
  'flc': 'Floodlight Counter',
  'fls': 'Floodlight Sales',
  'gclidw': 'Conversion Linker',
  'googtag': 'Google Tag',
  'html': 'Custom HTML',
  'img': 'Custom Image',
  'abtGeneric': 'AB TASTY Generic Tag',
  'adm': 'Adometry',
  'asp': 'AdRoll Smart Pixel',
  'ac360': 'Audience Center 360',
  'awc': 'Awin Conversion',
  'awj': 'AWIN Journey',
  'bb': 'Bizrate Insights Buyer Survey Solution',
  'bsa': 'Bizrate Insights Site Abandonment Survey Solution',
  'csm': 'comScore Unified Digital Measurement',
  'cts': 'ClickTale Standard Tracking (OBSOLETE)',
  'cegg': 'Crazy Egg',
  'crto': 'Criteo OneTag',
  'dstag': 'DistroScale Tag',
  'm6d': 'Distillery Universal Pixel',
  'ela': 'Eulerian Analytics',
  'fxm': 'FoxMetrics',
  'awcc': 'Google Ads Calls from Website Conversion',
  'awud': 'Google Ads User-provided Data Event',
  'cloud_retail': 'Cloud Retail',
  'automl': 'Recommendations AI',
  'gfct': 'Google Flights Conversion Tracking',
  'gfpa': 'Google Flights Price Accuracy',
  'ga': 'Google Analytics - Classic (LEGACY)',
  'ua': 'Google Analytics - Universal Analytics (LEGACY)',
  'opt': 'Google Optimize (LEGACY)',
  'gcs': 'Google Surveys Website Satisfaction (LEGACY)',
  'ts': 'Google Trusted Stores',
  'hjtc': 'Hotjar Tracking Code',
  'infinity': 'Infinity Call Tracking Tag',
  'k50Init': 'K50 tracking tag',
  'll': 'LeadLab',
  'bzi': 'LinkedIn Insight',
  'ljs': 'Lytics JS Tag',
  'ms': 'Marin Software',
  'mpm': 'Mediaplex - IFRAME MCT Tag',
  'mpr': 'Mediaplex - Standard IMG ROI Tag',
  'baut': 'Microsoft Advertising Universal Event Tracking',
  'mf': 'Mousefow',
  'ta': 'AdAdvisor',
  'ndcr': 'DCR Static',
  'nudge': 'Nudge Content Analytics',
  'okt': 'Oktopost Tracking Code',
  'omc': 'Optimise Conversion Tag',
  'messagemate': 'Message Mate',
  'pa': 'Perfect Audience Pixel',
  'pc': 'Personali Canvas',
  'pntr': 'Pinterest Tag',
  'placedPixel': 'Placed',
  'pijs': 'Pulse Insights Voice of Customer Platform',
  'qca': 'Quantcast Advertise',
  'qcm': 'Quantcast Measure',
  'qpx': 'Quora Pixel',
  'scjs': 'SaleCycle JavaScript Tag',
  'scp': 'SaleCycle Pixel Tag',
  'sfc': 'SearchForce JavaScript Tracking for Conversion Page',
  'sfl': 'SearchForce JavaScript Tracking for Landing Page',
  'sfr': 'SearchForce Redirection Tracking',
  'shareaholic': 'Shareaholic',
  'svw': 'Survicate Widget',
  'tpdpx': 'Tapad Conversion Pixel',
  'tdlc': 'Tradedoubler Lead Conversion',
  'tdsc': 'Tradedoubler Sale Conversion',
  'tc': 'Turn Conversion Tracking',
  'tdc': 'Turn Data Collection',
  'twitter_website_tag': 'Twitter Universal Website Tag (LEGACY)',
  'uspt': 'Upsellit Confirmation Tag',
  'uslt': 'Upsellit Global Footer Tag',
  'vdc': 'VisualDNA Conversion Tag',
  'xpsh': 'Xtremepush - Web Push & Onsite Engagement',
  'yieldify': 'Yieldify',
    }
  
    return tagTypeArray[tag.type];
    
  }