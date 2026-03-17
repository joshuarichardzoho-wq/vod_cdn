/**
 * 
 * @param {Object} data - VOD category vs ids mapping {completed : [id1, id2], processing: [id3, id4]}
 * @param {String} sortBy - Key to sort by (e.g., 'uploadtime', 'title', etc.)
 * @param {Object} sortBy - { completed : { sortKey : 'uploadtime', desc : true}, processing: {sortKey : 'title'}}
 * @param {Boolean} desc - Sort order, true for descending, false for ascending
 */

class VodSorter {
    constructor(data)
    {
        this.list = {};
        this.sortBy = {};
        this.data = data.data || {};
        this.activePage = {};
        this.pageInfo = {};
        this.pageConfig = 
        {
            '__all__' : 
            {
                size : 20,
                maxVisible : 4,
                pagesElemCount : 8
            } 
        };

        if(typeof data.pageConfig === 'object')
        {
            for(const category in data.pageConfig) // whatever given i will store
            {
                const config = data.pageConfig[category];
                this.setPageConfig(category, config); // setTotalPages will not be called here as no list is added yet
            }
        }

        this.addList(data.list, data.sortBy, data.desc, data.dataType); // setTotalPages and setPageInfo will be called here
    }

    ensureValidInt (input, defaultValue)
    {
        input = Math.trunc(Number(input));
        return (input > 0) ? input : defaultValue;
    }

    getValidCategories (categories)
    {
        if(typeof categories === 'undefined')
        {
            categories = Object.keys(this.list);
        }
        else
        {
            categories = Array.isArray(categories) ? categories : [categories];
            categories = categories.filter(cat => (cat in this.list));
        }

        return categories;
    }

    isValidCategory (category)
    {
        return (category in this.list);
    }

    // Not needed but keep it
    
    findPage(category, id)
    {
        const negativeIndex = -1;

        if(!this.isValidCategory(category))
        {
            return negativeIndex;
        }

        const ids = this.list[category];
        const index = ids.indexOf(id);

        if(index === negativeIndex)
        {
            return negativeIndex;
        }

        const pageSize = this.getPageConfig(category, 'size');

        return Math.floor(index / pageSize) + 1;
    }

    setTotalPages (category, newPageSize)
    {
        if(!this.isValidCategory(category))
        {
            return;
        }

        const size = this.ensureValidInt(newPageSize, (this.getPageConfig(category, 'size') || 20));        
        const info = this.activePage[category] = this.activePage[category] || {};
        const totalPages = Math.ceil(this.getCategoryLength(category) / size);

        if(info.totalPages !== totalPages)
        {
            info.totalPages = totalPages;
        }
    }

    setPageConfig (category, newConfig)
    {
        /**
         * Cases to consider:
         * 1. setPageConfig will be called before adding any list, so totalItems will be 0
         * 2. total items can be less than new page size
         */
        category = category || '__all__';
        
        const config = this.pageConfig[category] = this.pageConfig[category] || {};
        const maxVisiblePages = newConfig.maxVisiblePages;
        const pagesElemCount = newConfig.pagesElemCount;
        const size = newConfig.pageSize;

        if(typeof size !== 'undefined')
        {
            const oldVal = config.size;
            const newPageSize = size;

            if(oldVal === newPageSize)
            {
                return;
            }

            config.size = newPageSize;

            const categories = (category === '__all__') ? this.getValidCategories() : [category];
                
            for(const cat of categories)
            {
                this.setTotalPages(cat, newPageSize); // if size changes, page info also changes
            }

            this.setPageInfo(categories); // reset page info for all categories
        }

        const set = (key, newVal, defaultVal) => // when dynamically changing, if oldVal is valid int then use it, else use newVal if valid int else use defaultVal
        {   
            const oldVal = config[key];
            
            newVal = this.ensureValidInt(newVal, (oldVal || defaultVal));
        
            if(oldVal !== newVal)
            {
                config[key] = newVal;
            }
        }

        if(typeof maxVisiblePages !== 'undefined')
        {
            set('maxVisible', maxVisiblePages, 4);
        }

        if(typeof pagesElemCount !== 'undefined')
        {
            set('pagesElemCount', pagesElemCount, 8);
        }
    }

    getPageConfig (category, key)
    {
        const defaultConfig = this.pageConfig.__all__;
        const categoryConfig = this.pageConfig[category] || defaultConfig;

        if(typeof key === 'undefined')
        {
            return categoryConfig;
        }

        return (key in categoryConfig) ? categoryConfig[key] : defaultConfig[key];
    }

    setPageInfo (categories, pageNo)
    {
        categories = this.getValidCategories(categories);
        
        const updatedPageInfo = categories.reduce((obj, cat) =>
        {
            const currentPageNo = this.getCurrentPageNo(cat);
            const size = this.getPageConfig(cat, 'size');
            const totalPages = this.getTotalPages(cat);

            pageNo = this.ensureValidInt(pageNo, (currentPageNo || 1));

            if(pageNo > totalPages)
            {
                pageNo = totalPages;
            }

            if(currentPageNo !== pageNo)
            {
                const info = this.activePage[cat] = this.activePage[cat] || {};
                info.currentPage = pageNo;
            }

            const itemsInView = this.list[cat].slice((pageNo - 1) * size, pageNo * size);

            obj[cat] =
            {
                [pageNo] : itemsInView
            };

            return obj;
        }, {});

        Object.assign(this.pageInfo, updatedPageInfo);

        return updatedPageInfo;
    }

    getCategoryLength (category)
    {
        if(this.isValidCategory(category))
        {
            return this.list[category].length;
        }

       return 0;
    }

    getItemsInView (category)
    {
        let arr = [];

        if(this.isValidCategory(category))
        {
            arr = Object.values(this.pageInfo[category] || {})[0] || arr; 
        }

        return arr;
    }

    getItemsInPage (category, pageNo)
    {
        if(!this.isValidCategory(category))
        {
            return [];
        }

        const size = this.getPageConfig(category, 'size');
        const totalPages = this.getTotalPages(category);
        pageNo = this.ensureValidInt(pageNo, 1);

        if(pageNo > totalPages)
        {
            pageNo = totalPages;
        }

        const ids = this.list[category];
        return ids.slice((pageNo - 1) * size, pageNo * size);
    }

    isItemInView (id, category)
    {
        const itemsInView = this.getItemsInView(category);
        return itemsInView.includes(id);
    }

    getCurrentPageNo (category)
    {
        return (this.activePage[category] || {}).currentPage;
    }

    getTotalPages (category)
    {
        return (this.activePage[category] || {}).totalPages || 0;
    }

    getPages (category)
    {
        const totalItems = this.getCategoryLength(category);
        let pageSize = this.getPageConfig(category, 'size');

        if(!totalItems || totalItems <= pageSize)
        {
            return [];
        }

        const totalPages = this.getTotalPages(category);

        let totalElems = this.getPageConfig(category, 'pagesElemCount');
        let maxPageVisibile = this.getPageConfig(category, 'maxVisible');
        let currentPageNo = this.getCurrentPageNo(category);
        
        if(totalElems > totalPages)
        {
            totalElems = totalPages;
        }

        if(maxPageVisibile > totalElems)
        {
            maxPageVisibile = totalElems;
        }

        if(currentPageNo > totalPages)
        {
            currentPageNo = totalPages;
        }

        const sidesDiff = (totalElems - maxPageVisibile);
        let maxSideRight = 0;
        let maxSideLeft = 0;

        if(sidesDiff > 5 )
        {
            maxSideRight = maxSideLeft = 3;
        }
        else if(sidesDiff > 3)
        {
            maxSideRight = maxSideLeft = 2;
        }
        else if(sidesDiff > 1)
        {
            maxSideRight = 2;
        }

        if(sidesDiff <= 1)
        {
            maxPageVisibile = totalElems;
        }

        const leftOverCount = totalElems - (maxSideRight + maxSideLeft);

        if(leftOverCount !== maxPageVisibile)
        {
            maxPageVisibile = leftOverCount;
        }

        let startLeft = Math.max(1, currentPageNo - Math.floor((maxPageVisibile/2)));
        let endRight = (startLeft + (maxPageVisibile - 1));

        if(endRight > totalPages)
        {
            endRight = totalPages;
            startLeft = Math.max(1, endRight - (maxPageVisibile - 1));
        }

        const diffOfLast = (totalPages - endRight);
        let rightSide = [];

        if(diffOfLast > 0)
        {
            const maxSideLength = Math.min(diffOfLast, maxSideRight);
            
            maxSideRight = maxSideRight - maxSideLength;

            if(maxSideLength)
            {
                rightSide = Array.from({length : maxSideLength}, (_, i) => i + (totalPages - (maxSideLength - 1)));
            }
        }

        if(maxSideRight == 2 && maxSideLeft == 0)
        {
            maxSideLeft = 2;
            maxSideRight = 0;
        }
        
        const diffOfFirst = (startLeft - 1);
        let leftSide = [];

        if(diffOfFirst > 0)
        {
            const maxSideLength = Math.min(diffOfFirst, maxSideLeft);

            maxSideLeft = maxSideLeft - maxSideLength;

            if(maxSideLength)
            {
                leftSide = Array.from({length : maxSideLength}, (_, i) => i + 1);
            }
        }

        startLeft = startLeft - maxSideRight;
        endRight = endRight + maxSideLeft;

        const pages = [];
        const dot = '...';

        for(let i = startLeft; i <= endRight; i++)
        {
            pages.push(i);
        }
        
        if((rightSide[0] - endRight) > 1)
        {
            rightSide[0] = dot;
        }

        let leftSideLastIndex = (leftSide.length - 1);

        if((startLeft - leftSide[leftSideLastIndex]) > 1)
        {
            leftSide[leftSideLastIndex] = dot;
        }

        return [...leftSide, ...pages, ...rightSide];
    }

    getPageInfo (category)
    {
       return this.pageInfo[category] || {};
    }

    addList (list, sortBy, desc, dataType)
    {
        if(typeof list !== 'object')
        {
            return;
        }

        const isSortByObject = (typeof sortBy === 'object');
        const isSortByString = (typeof sortBy === 'string');

        if(typeof sortBy === 'number')
        {
            sortBy = String(sortBy);
        }

        if(!isSortByObject && (!isSortByString || typeof dataType === 'undefined')) // addlist must have dataType when sortBy is string
        {
            return;
        }

        for(const k in list)
        {
            const ids = list[k];
            
            if(!Array.isArray(ids) || !ids.length)
            {
                continue;
            }

            if(isSortByObject) 
            {
                const config = sortBy[k];

                if(typeof config !== 'object' || 
                    typeof config.sortKey === 'undefined' || 
                    (typeof config.dataType === 'undefined' && typeof config.dataType === 'undefined'))
                {
                    continue;
                }
            }

            this.list[k] = ids;
        }
 
        const {pageInfo} = this.sort(sortBy, desc, dataType);
        return pageInfo;
    }

    static get sorters ()
    {
        const dataTypeSorters =
        {
            number : (a, b, desc) => desc ? b - a : a - b,
            string : (a, b, desc) => desc ? b.localeCompare(a) : a.localeCompare(b)
        }

        const sorter = (dataType, a, b, desc) =>
        {
            var value; // + b goes forward, - a goes backward
                
            if (typeof a !== dataType) // regardless of desc, invalid dataType goes backward
            {
                value = 1; // if only a is invalid, b goes forward
            }
            
            if (typeof b !== dataType) // regardless of desc, invalid dataType goes backward
            {
                value = value ? 0 : -1; // if only b is invalid, a goes forward, if both invalid, no change in order
            }

            if(typeof value === 'undefined')
            {
                value = dataTypeSorters[dataType](a, b, desc);
            }

            return value;
        }

        return {
            number : (a, b, desc) => sorter('number', a, b, desc),
            string : (a, b, desc) => sorter('string', a, b, desc)
        };
    }

    sort (sortBy, desc = false, dataType, category, overRide)
    {
        const sortByType = (typeof sortBy);
        const isSortByObject = (sortByType === 'object');
        const isSortByString = (sortByType === 'string');
        
        if(sortByType === 'number')
        {
            sortBy = String(sortBy);
        }

        if(!isSortByObject && !isSortByString) // dataType is not mandatory here
        {
            return;
        }

        const list = this.list;
        const data = this.data;
        const empty = {};
        
        if(isSortByString)
        {
            if(typeof category === 'string')
            {
                if(!(category in list))
                {
                    return empty;
                }

                sortBy = 
                {
                    [category] : { sortKey : sortBy, desc, dataType} 
                };
            }
            else
            {
                sortBy = this.getValidCategories().reduce((obj, k) => 
                {
                    obj[k] = { sortKey : sortBy, desc, dataType };
                    return obj;
                }, {});
            }
        }

        const sortedKeys = [];

        for(const key in sortBy)
        {
            const newConfig = sortBy[key];
            const ids = list[key];

            if(typeof newConfig !== 'object' || !Array.isArray(ids) || !ids.length)
            {
                continue;
            }

            let oldConfig = this.sortBy[key]; 
            let isFirstSort;
            
            if(typeof oldConfig === 'undefined')
            {
                isFirstSort = true;
                oldConfig = {};
            }
            
            let sortDataType = newConfig.dataType;

            if(typeof sortDataType === 'undefined')
            {
                sortDataType = newConfig.dataType = oldConfig.dataType;
            }
            
            const sortingMethod = VodSorter.sorters[sortDataType] || sortBy.sortFn;
            const sortKey = newConfig.sortKey;
            let isDesc = newConfig.desc;

            if(typeof isDesc !== 'boolean')
            {
                isDesc = newConfig.desc = false;
            }

            if(typeof sortKey === 'undefined' || !sortingMethod)
            {
                continue;
            }

            const oldConfigKeys = Object.keys(oldConfig);

            if(oldConfigKeys.length && !(oldConfigKeys.some(conf => oldConfig[conf] !== newConfig[conf])) && !overRide)
            {
                continue;
            }

            const newList = ids.sort((a, b) => 
            {
                const aData = data[a] || {};
                const bData = data[b] || {};

                return sortingMethod(aData[sortKey], bData[sortKey], isDesc);
            });

            const sortedIds = [...new Set(newList)];
            this.sortBy[key] = newConfig;
            list[key] = sortedIds;
            
            if(isFirstSort)
            {
                this.setTotalPages(key); // its for specific key/category
            }

            sortedKeys.push(key);
        }

        const pageInfo = this.setPageInfo(sortedKeys); // reset page info for sorted categories
        return { pageInfo, keys : sortedKeys};
    }

    add(id, category)
    {
        const sortedConfig = this.sortBy[category];
        const ids = this.list[category];
        
        if(typeof id === 'undefined' || typeof category === 'undefined' || 
            typeof ids === 'undefined' || typeof sortedConfig === 'undefined')
        {
            return;
        }

        if(ids.includes(id))
        {
            this.delete(id, category, true);
        }
        
        const dataType = sortedConfig.dataType;
        const sortingMethod = VodSorter.sorters[dataType];
        const isAsc = !(sortedConfig.desc);
        const sortKey = sortedConfig.sortKey;
        
        const data = this.data;
        const sortVal =  data[id][sortKey];
        const idsLength = ids.length;

        const set = () =>
        {
            this.setTotalPages(category);
            this.setPageInfo(category);
        }

        if(dataType !== typeof sortVal || !idsLength || !sortingMethod)
        {
            ids.push(id);
            set();
            return;
        }
        
        const compareCB = isAsc ? (mid, ref) => mid < ref : (mid, ref) => mid > ref;
        var ranges = [];

        if(dataType === 'string')
        {
            const compareChar = sortVal.charAt(0).toLowerCase();
            const getCompareval = (index) => data[ids[index]][sortKey].charAt(0).toLowerCase();  
            
            ranges = getRange(compareChar, getCompareval);
        }
        else if(dataType === 'number')
        {
            ranges = getRange(sortVal, (index) => data[ids[index]][sortKey]);
        }

        var sortIndxIds = [];

        if(ranges.length === 1)
        {
            const index = ranges[0];
            
            sortIndxIds = [id, ids[index]]; 
            sortIndxIds.sort((a, b) => sortingMethod(data[a][sortKey], data[b][sortKey], !isAsc));
            ids.splice(index, 1, ...sortIndxIds);
        }
        else if(ranges.length === 2)
        {
            sortIndxIds = ids.slice(ranges[0], ranges[1] + 1);
            sortIndxIds.unshift(id);
            sortIndxIds.sort((a, b) => sortingMethod(data[a][sortKey], data[b][sortKey], !isAsc));

            const newIndex = sortIndxIds.indexOf(id);
            const lastIndex = (sortIndxIds.length - 1);
            let newSortIndxIds, otherId;
            
            if(newIndex == lastIndex)
            {
                otherId = sortIndxIds[newIndex - 1];
                newSortIndxIds = [otherId, id];
            }
            else
            {
                otherId = sortIndxIds[newIndex + 1];
                newSortIndxIds = [id, otherId];
            }

            ids.splice(ids.indexOf(otherId), 1, ...newSortIndxIds);
        }

        set();
        return this.isItemInView(id, category);

        function getRange (refVal, getCompareval)
        {
            const idsLength = ids.length;

            if(!idsLength)
            {
                return [idsLength];
            }

            const start = binarySearch(0, idsLength, false, getCompareval);

            if(start == idsLength)
            {
                return [start - 1]
            }
            else if(getCompareval(start) !== refVal)
            {
                return [start];
            }

            const end = binarySearch(start, idsLength, true, getCompareval) - 1;
            return (start == end) ? [start] : [start, end];

            function binarySearch (left, right, isRightwards, getCompareval)
            {
                while(left < right)
                {
                    const mid = (left + right) >> 1;
                    const midVal = getCompareval(mid);

                    if(compareCB(midVal, refVal) || (isRightwards && (midVal == refVal)))
                    {
                        left = mid + 1;
                    }
                    else
                    {
                        right = mid;
                    }
                }

                return left;
            }
        };
    }

    get()
    {
        return this.list;
    }

    delete (id, category, isReindexing)
    {
        if(typeof id === 'undefined')
        {
            return;
        }

        const deleteItem = (category) =>
        {
            const ids = this.list[category];
            const idIndex = ids.indexOf(id);

            if(idIndex == -1)
            {
                return;
            }

            ids.splice(idIndex, 1);
            
            if(!isReindexing)
            {
                this.setTotalPages(category);
                this.setPageInfo(category);
            }
        }

        if(typeof category === 'undefined')
        {
            this.getValidCategories().map(cat => deleteItem(cat));
        }
        else if(this.isValidCategory(category))
        {
            deleteItem(category);
        }
    }

    update(id, oldCategory, newCategory)
    {
        if(!this.isValidCategory(newCategory) || !this.isValidCategory(oldCategory))
        {
            return;
        }

        /**
         * if !this.isValidCategory(newCategory) is true then user should delete and addList
         */

        if(newCategory !== oldCategory) // newCategory === oldCategory is for reindexing case and this.add will handle that
        {
            this.delete(id, oldCategory);
        }
        
        return this.add(id, newCategory);
    }
}