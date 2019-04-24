import {View as Grid} from 'Controls/grid';
import TreeGridViewModel = require('Controls/_treeGrids/TreeGridView/TreeGridViewModel');
import entity = require('Types/entity');
import TreeGridView = require('Controls/_treeGrids/TreeGridView/TreeGridView');
import TreeControl = require('Controls/_treeGrids/TreeControl');


   /**
    * Hierarchical list with custom item template. Can load data from data source.
    * List of examples:
    * <ul>
    *    <li><a href="/materials/demo-ws4-edit-in-place">How to configure editing in your list</a>.</li>
    * </ul>
    *
    * @class Controls/TreeGrid
    * @extends Controls/Grid
    * @mixes Controls/interface/ISource
    * @mixes Controls/interface/IItemTemplate
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IGrouped
    * @mixes Controls/interface/INavigation
    * @mixes Controls/interface/IFilter
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/_list/interface/IList
    * @mixes Controls/_list/interface/IHierarchy
    * @mixes Controls/_list/interface/ITreeControl
    * @mixes Controls/interface/ITreeGridItemTemplate
    * @mixes Controls/_list/interface/IDraggable
    *
    * @mixes Controls/_list/BaseControlStyles
    * @mixes Controls/_list/ListStyles
    * @mixes Controls/_list/Grid/GridStyles
    * @mixes Controls/_treeGrids/TreeGrid/Styles
    * @mixes Controls/_list/ItemActions/ItemActionsStyles
    * @mixes Controls/_list/Swipe/SwipeStyles
    *
    * @mixes Controls/_list/Mover/MoveDialog/Styles
    * @mixes Controls/_paging/PagingStyles
    * @mixes Controls/_list/DigitButtonsStyles
    * @mixes Controls/_list/Grid/SortButtonStyles
    *
    * @control
    * @public
    * @author Авраменко А.С.
    * @category List
    * @demo Controls-demo/List/TreeGrid/BasePG
    */

   var Tree = Grid.extend(/** @lends Controls/TreeGrid */{
      _viewName: TreeGridView,
      _viewTemplate: TreeControl,
      _getModelConstructor: function() {
         return TreeGridViewModel;
      },
      getOptionTypes: function() {
         return {
            keyProperty: entity.descriptor(String).required(),
            parentProperty: entity.descriptor(String).required()
         };
      },
      toggleExpanded: function(id) {
         this._children.listControl.toggleExpanded(id);
      }
   });
   export = Tree;

