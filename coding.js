// coding.js — InterviewOS Coding Questions (100 Most Important)

const QUESTIONS = [
  // ===== ARRAYS (1-18) =====
  {
    id: 1, title: "Two Sum", topic: "Array", difficulty: "easy",
    companies: ["Google", "Amazon", "Facebook"],
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    hint: "Use a hash map to store seen values and check for complement on each step.",
    approach: ["Brute force: O(n²) — check every pair", "Optimal: One-pass hash map storing each element's index, look up complement in O(1)", "Return indices as soon as target pair is found"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 2, title: "Best Time to Buy and Sell Stock", topic: "Array", difficulty: "easy",
    companies: ["Amazon", "Microsoft", "Adobe"],
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve. You may not engage in multiple transactions simultaneously.",
    hint: "Track the minimum price seen so far and calculate max profit at each step.",
    approach: ["Track minPrice as you iterate", "At each step, calculate profit = prices[i] - minPrice", "Update maxProfit if current profit is greater"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 3, title: "Product of Array Except Self", topic: "Array", difficulty: "medium",
    companies: ["Facebook", "Amazon", "LeetCode"],
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all elements of nums except nums[i]. You must write an algorithm that runs in O(n) time and without using the division operation.",
    hint: "Use prefix and suffix product arrays — build left products then multiply right products in-place.",
    approach: ["Build left product array (prefix products)", "Multiply from right side (suffix products) in one more pass", "Combine both without using division"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 4, title: "Maximum Subarray (Kadane's)", topic: "Array", difficulty: "medium",
    companies: ["Microsoft", "Google", "Amazon"],
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum. This is the classic Kadane's Algorithm problem.",
    hint: "At each element, decide: extend current subarray or start fresh from this element.",
    approach: ["Keep running sum (currentSum)", "If currentSum < 0, reset to 0", "Track maxSum throughout the pass"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 5, title: "Container With Most Water", topic: "Array", difficulty: "medium",
    companies: ["Google", "Amazon", "Bloomberg"],
    description: "You are given an integer array height of length n. Find two lines that together with the x-axis form a container that can hold the most water. Return the maximum amount of water a container can store.",
    hint: "Two pointers from both ends. Always move the pointer with the shorter height inward.",
    approach: ["Place left pointer at 0, right at n-1", "Calculate area = min(height[l], height[r]) * (r - l)", "Move the shorter side's pointer inward"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 6, title: "3Sum", topic: "Array", difficulty: "medium",
    companies: ["Facebook", "Google", "Amazon"],
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, j != k, and nums[i] + nums[j] + nums[k] == 0. The solution must not contain duplicate triplets.",
    hint: "Sort array first, then use two pointers for the inner loop. Skip duplicates carefully.",
    approach: ["Sort the array", "For each element, use two-pointer on the remaining", "Skip duplicates at each level to avoid repetition"],
    time: "O(n²)", space: "O(1)"
  },
  {
    id: 7, title: "Trapping Rain Water", topic: "Array", difficulty: "hard",
    companies: ["Amazon", "Facebook", "Google"],
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    hint: "Use two pointers. Water at each position = min(maxLeft, maxRight) - height[i].",
    approach: ["Two pointer approach: left and right", "Track leftMax and rightMax", "Add water trapped at each position = min(leftMax,rightMax) - height"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 8, title: "Rotate Array", topic: "Array", difficulty: "medium",
    companies: ["Microsoft", "Amazon"],
    description: "Given an integer array nums, rotate the array to the right by k steps, where k is non-negative.",
    hint: "Reverse the entire array, then reverse first k elements, then reverse the rest.",
    approach: ["k = k % n to handle overflow", "Reverse entire array", "Reverse [0, k-1], then reverse [k, n-1]"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 9, title: "Find Minimum in Rotated Sorted Array", topic: "Array", difficulty: "medium",
    companies: ["Amazon", "Microsoft", "Apple"],
    description: "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the rotated array, return the minimum element in O(log n) time.",
    hint: "Binary search — compare mid with right to decide which half has the minimum.",
    approach: ["Binary search: if arr[mid] > arr[right], min is in right half", "Otherwise min is in left half (including mid)", "Narrow down until single element"],
    time: "O(log n)", space: "O(1)"
  },
  {
    id: 10, title: "Merge Intervals", topic: "Array", difficulty: "medium",
    companies: ["Google", "Facebook", "Microsoft"],
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    hint: "Sort by start time. Then merge when current interval's start ≤ last merged end.",
    approach: ["Sort intervals by start time", "Iterate; if overlap, extend end of last merged interval", "Otherwise push new interval"],
    time: "O(n log n)", space: "O(n)"
  },
  {
    id: 11, title: "Search in Rotated Sorted Array", topic: "Array", difficulty: "medium",
    companies: ["Facebook", "Google", "Uber"],
    description: "There is an integer array nums sorted in ascending order (with distinct values). The array has been rotated at some pivot. Given the array and an integer target, return the index of target if it is in nums, or -1 if it is not.",
    hint: "Binary search. At each step, determine which half is sorted and check if target is in that half.",
    approach: ["Standard binary search with rotation check", "Identify which half is sorted", "Check if target falls in sorted half, narrow accordingly"],
    time: "O(log n)", space: "O(1)"
  },
  {
    id: 12, title: "Subarray Sum Equals K", topic: "Array", difficulty: "medium",
    companies: ["Facebook", "Google", "Amazon"],
    description: "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.",
    hint: "Use prefix sum + hash map. Count how many times (prefixSum - k) has appeared before.",
    approach: ["Build prefix sum as you iterate", "Use a hash map storing count of each prefix sum", "At each step, add map[prefixSum - k] to result"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 13, title: "Longest Consecutive Sequence", topic: "Array", difficulty: "medium",
    companies: ["Google", "Facebook"],
    description: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time.",
    hint: "Use a HashSet. For each number, only start counting if num-1 is NOT in the set (start of sequence).",
    approach: ["Put all numbers in a HashSet", "For each num, if num-1 not in set → start of sequence", "Count consecutive numbers from that start"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 14, title: "Jump Game", topic: "Array", difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    description: "You are given an integer array nums. You are initially positioned at the first index, and each element represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.",
    hint: "Track the farthest index you can reach at each step. If i ever exceeds farthest, return false.",
    approach: ["Track maxReach = 0", "For each i, if i > maxReach return false", "Update maxReach = max(maxReach, i + nums[i])"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 15, title: "Sort Colors (Dutch Flag)", topic: "Array", difficulty: "medium",
    companies: ["Microsoft", "Facebook", "Apple"],
    description: "Given an array nums with n objects colored red, white, or blue (0, 1, 2), sort them in-place so that objects of the same color are adjacent, with the colors in order.",
    hint: "Dutch National Flag algorithm — three pointers: low, mid, high.",
    approach: ["low=0, mid=0, high=n-1", "nums[mid]==0: swap with low, advance both", "nums[mid]==2: swap with high, retreat high; nums[mid]==1: advance mid"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 16, title: "Spiral Matrix", topic: "Array", difficulty: "medium",
    companies: ["Microsoft", "Google", "Amazon"],
    description: "Given an m x n matrix, return all elements of the matrix in spiral order.",
    hint: "Use four boundaries (top, bottom, left, right) and shrink them as you traverse each layer.",
    approach: ["Define top, bottom, left, right boundaries", "Traverse right → down → left → up, shrinking bounds", "Continue until boundaries cross"],
    time: "O(m*n)", space: "O(1)"
  },
  {
    id: 17, title: "Set Matrix Zeroes", topic: "Array", difficulty: "medium",
    companies: ["Microsoft", "Amazon"],
    description: "Given an m x n integer matrix, if an element is 0, set its entire row and column to 0's, and return the matrix. You must do it in place.",
    hint: "Use the first row and first column as markers to avoid extra space.",
    approach: ["First pass: mark rows/cols using first row and column as flags", "Second pass: use flags to zero out cells", "Handle first row/col separately"],
    time: "O(m*n)", space: "O(1)"
  },
  {
    id: 18, title: "Majority Element", topic: "Array", difficulty: "easy",
    companies: ["Amazon", "Apple", "Google"],
    description: "Given an array nums of size n, return the majority element. The majority element is the element that appears more than ⌊n / 2⌋ times. You may assume that the majority element always exists in the array.",
    hint: "Boyer-Moore Voting Algorithm — track a candidate and its vote count.",
    approach: ["Start with candidate = nums[0], count = 1", "For each next element: if same as candidate, count++; else count--", "When count hits 0, change candidate"],
    time: "O(n)", space: "O(1)"
  },

  // ===== STRINGS (19-30) =====
  {
    id: 19, title: "Longest Substring Without Repeating Characters", topic: "String", difficulty: "medium",
    companies: ["Amazon", "Bloomberg", "Facebook"],
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    hint: "Sliding window with a set to track characters in current window.",
    approach: ["Use two pointers (left, right) as window", "Expand right; if duplicate, shrink from left", "Track max window size"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 20, title: "Valid Anagram", topic: "String", difficulty: "easy",
    companies: ["Google", "Amazon", "Apple"],
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    hint: "Count character frequencies using an array of size 26 (for lowercase letters).",
    approach: ["Count chars in s (increment) and t (decrement)", "If any count != 0 at end, return false", "Alternatively sort both strings and compare"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 21, title: "Group Anagrams", topic: "String", difficulty: "medium",
    companies: ["Facebook", "Amazon", "Uber"],
    description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    hint: "Sort each string as a key in a hash map — all anagrams will have the same sorted key.",
    approach: ["For each string, sort characters as key", "Group strings by their sorted key in a map", "Return all map values"],
    time: "O(n·k·log k)", space: "O(n·k)"
  },
  {
    id: 22, title: "Longest Palindromic Substring", topic: "String", difficulty: "medium",
    companies: ["Amazon", "Microsoft", "Apple"],
    description: "Given a string s, return the longest palindromic substring in s.",
    hint: "Expand around center — for each character (and each pair), expand outward while characters match.",
    approach: ["For each index, expand around center for odd and even lengths", "Track the start and max length of the longest palindrome", "Return the substring"],
    time: "O(n²)", space: "O(1)"
  },
  {
    id: 23, title: "Valid Parentheses", topic: "String", difficulty: "easy",
    companies: ["Google", "Amazon", "Facebook"],
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    hint: "Use a stack. Push opening brackets, and on closing bracket check if top of stack matches.",
    approach: ["Push opening brackets to stack", "On closing bracket, pop and check if it matches", "Stack must be empty at the end"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 24, title: "Minimum Window Substring", topic: "String", difficulty: "hard",
    companies: ["Facebook", "Google", "Snapchat"],
    description: "Given two strings s and t of lengths m and n, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
    hint: "Sliding window with two frequency maps — expand right and shrink left when all chars are covered.",
    approach: ["Count character frequencies of t", "Expand right, decrement count in map", "When all covered, try shrinking left to minimize window"],
    time: "O(m+n)", space: "O(m+n)"
  },
  {
    id: 25, title: "Reverse Words in a String", topic: "String", difficulty: "medium",
    companies: ["Microsoft", "Apple", "Amazon"],
    description: "Given an input string s, reverse the order of the words. A word is defined as a sequence of non-space characters. The words in s will be separated by at least one space.",
    hint: "Split by spaces, filter empty strings, reverse the list, join with single space.",
    approach: ["Trim and split by whitespace", "Reverse the array of words", "Join with single space"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 26, title: "String Compression", topic: "String", difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    description: "Given an array of characters chars, compress it using the following algorithm: Begin with an empty string s. For each group of consecutive repeating characters in chars, append the character, and if the count > 1, also append the count.",
    hint: "Use two pointers — one to read the original array and one to write the compressed result.",
    approach: ["Use read and write pointers", "Count consecutive chars, write char then count if > 1", "Count digits must be written as individual characters"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 27, title: "Palindrome Check", topic: "String", difficulty: "easy",
    companies: ["Facebook", "Microsoft", "Amazon"],
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    hint: "Two pointers from both ends, skipping non-alphanumeric chars.",
    approach: ["Left pointer at start, right at end", "Skip non-alphanumeric chars", "Compare lowercase of both; move inward"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 28, title: "Find All Anagrams in a String", topic: "String", difficulty: "medium",
    companies: ["Facebook", "Google"],
    description: "Given two strings s and p, return an array of all the start indices of p's anagrams in s. You may return the answer in any order.",
    hint: "Sliding window of size p.length() — compare frequency maps.",
    approach: ["Create freq map of p", "Slide window of size p.length() across s", "When freq maps match, record start index"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 29, title: "Decode Ways", topic: "String", difficulty: "medium",
    companies: ["Facebook", "Amazon", "Microsoft"],
    description: "A message containing letters from A-Z can be encoded into numbers using 'A' -> 1, 'B' -> 2, ..., 'Z' -> 26. Given a string s containing only digits, return the number of ways to decode it.",
    hint: "Dynamic programming. dp[i] = ways to decode s[0..i-1].",
    approach: ["dp[0] = 1 (empty string)", "dp[i] = dp[i-1] if s[i-1] valid single digit + dp[i-2] if s[i-2..i-1] valid two digits", "Handle zeros carefully"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 30, title: "Longest Common Prefix", topic: "String", difficulty: "easy",
    companies: ["Google", "Amazon", "Adobe"],
    description: "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.",
    hint: "Take first string as reference. Compare character by character with all others.",
    approach: ["Take strs[0] as prefix", "For each char in prefix, compare with all strings", "Shorten prefix until all match or empty"],
    time: "O(S) where S = sum of all chars", space: "O(1)"
  },

  // ===== LINKED LIST (31-40) =====
  {
    id: 31, title: "Reverse Linked List", topic: "Linked List", difficulty: "easy",
    companies: ["Amazon", "Microsoft", "Google"],
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    hint: "Keep track of previous node. Reverse the next pointer of each node as you traverse.",
    approach: ["prev = null, curr = head", "While curr: save curr.next, point curr.next to prev, advance both", "Return prev as new head"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 32, title: "Detect Cycle in Linked List", topic: "Linked List", difficulty: "easy",
    companies: ["Amazon", "Microsoft", "Adobe"],
    description: "Given head, the head of a linked list, determine if the linked list has a cycle in it. Return true if there is a cycle in the linked list, otherwise, return false.",
    hint: "Floyd's Cycle Detection — slow and fast pointers. If they meet, there's a cycle.",
    approach: ["slow moves 1 step, fast moves 2 steps", "If fast reaches null → no cycle", "If slow == fast → cycle detected"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 33, title: "Merge Two Sorted Lists", topic: "Linked List", difficulty: "easy",
    companies: ["Amazon", "Microsoft", "Google"],
    description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.",
    hint: "Use a dummy head node and a pointer. Compare nodes from both lists at each step.",
    approach: ["Create dummy node, curr = dummy", "While both lists non-empty: pick smaller node, advance", "Attach remaining non-empty list"],
    time: "O(m+n)", space: "O(1)"
  },
  {
    id: 34, title: "Reorder List", topic: "Linked List", difficulty: "medium",
    companies: ["Facebook", "Amazon"],
    description: "Given the head of a singly linked list L, reorder it to: L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …. You may not modify the values in the list's nodes, only nodes themselves may be changed.",
    hint: "1) Find middle. 2) Reverse second half. 3) Merge two halves alternately.",
    approach: ["Find middle using slow/fast pointers", "Reverse the second half in-place", "Interleave first and reversed second halves"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 35, title: "Remove Nth Node From End", topic: "Linked List", difficulty: "medium",
    companies: ["Amazon", "Microsoft", "Apple"],
    description: "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
    hint: "Two pointers — advance fast by n+1 steps, then move both until fast is null.",
    approach: ["Dummy node before head, fast and slow start there", "Move fast n+1 steps ahead", "Move both until fast is null; slow.next is the node to remove"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 36, title: "Add Two Numbers (Linked List)", topic: "Linked List", difficulty: "medium",
    companies: ["Amazon", "Microsoft", "Bloomberg"],
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order. Add the two numbers and return the sum as a linked list.",
    hint: "Add corresponding digits and carry. Create new nodes for each digit of result.",
    approach: ["Iterate both lists simultaneously", "Sum = l1.val + l2.val + carry", "Create node for sum % 10, carry = sum / 10"],
    time: "O(max(m,n))", space: "O(max(m,n))"
  },
  {
    id: 37, title: "Intersection of Two Linked Lists", topic: "Linked List", difficulty: "easy",
    companies: ["Amazon", "Facebook"],
    description: "Given the heads of two singly linked-lists headA and headB, return the node at which the two lists intersect. If the two linked lists have no intersection at all, return null.",
    hint: "Two pointers — when one reaches end, redirect to other's head. They meet at intersection.",
    approach: ["Pointer a starts at headA, b at headB", "When a reaches null, redirect to headB; b to headA", "They meet at intersection (or null)"],
    time: "O(m+n)", space: "O(1)"
  },
  {
    id: 38, title: "Copy List with Random Pointer", topic: "Linked List", difficulty: "medium",
    companies: ["Amazon", "Microsoft", "Facebook"],
    description: "A linked list of length n is given such that each node contains an additional random pointer, which could point to any node in the list, or null. Construct a deep copy of the list.",
    hint: "Use a hash map mapping each original node to its copy to resolve random pointers in second pass.",
    approach: ["Pass 1: Create copy of each node, store in map (original → copy)", "Pass 2: Set next and random pointers using the map", "Return map[head]"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 39, title: "Sort List (Merge Sort)", topic: "Linked List", difficulty: "medium",
    companies: ["Amazon", "Google", "Bloomberg"],
    description: "Given the head of a linked list, return the list after sorting it in ascending order.",
    hint: "Merge sort: find middle, split, recursively sort each half, merge.",
    approach: ["Find middle using slow/fast pointers", "Recursively sort both halves", "Merge sorted halves"],
    time: "O(n log n)", space: "O(log n)"
  },
  {
    id: 40, title: "LRU Cache", topic: "Linked List", difficulty: "medium",
    companies: ["Amazon", "Google", "Microsoft"],
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put functions, both in O(1) average time.",
    hint: "Use a doubly linked list + hash map. Most recent at head, evict from tail.",
    approach: ["Hash map for O(1) key lookup", "Doubly linked list to maintain order of use", "On get/put, move node to head; on overflow, remove tail"],
    time: "O(1)", space: "O(capacity)"
  },

  // ===== TREES (41-55) =====
  {
    id: 41, title: "Maximum Depth of Binary Tree", topic: "Tree", difficulty: "easy",
    companies: ["Amazon", "Google", "Facebook"],
    description: "Given the root of a binary tree, return its maximum depth. Maximum depth is the number of nodes along the longest path from the root node to the farthest leaf node.",
    hint: "DFS recursion — return 1 + max(depth(left), depth(right)). Base case: node is null.",
    approach: ["Base: if root is null, return 0", "Recursively get depth of left and right subtrees", "Return 1 + max(leftDepth, rightDepth)"],
    time: "O(n)", space: "O(h)"
  },
  {
    id: 42, title: "Invert Binary Tree", topic: "Tree", difficulty: "easy",
    companies: ["Google", "Amazon", "Apple"],
    description: "Given the root of a binary tree, invert the tree, and return its root. This is the famous 'Google' problem — the tweet that inspired this question said 'Max Howell couldn't solve it in a Google interview.'",
    hint: "Swap left and right children recursively for every node.",
    approach: ["Base: if root is null, return null", "Swap root.left and root.right", "Recursively invert both subtrees"],
    time: "O(n)", space: "O(h)"
  },
  {
    id: 43, title: "Validate Binary Search Tree", topic: "Tree", difficulty: "medium",
    companies: ["Amazon", "Microsoft", "Facebook"],
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    hint: "Pass min and max bounds down recursively. Each node must be strictly between its bounds.",
    approach: ["Recursive with bounds: isValid(node, min, max)", "Left subtree: max becomes node.val", "Right subtree: min becomes node.val"],
    time: "O(n)", space: "O(h)"
  },
  {
    id: 44, title: "Level Order Traversal (BFS)", topic: "Tree", difficulty: "medium",
    companies: ["Amazon", "Microsoft", "Google"],
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    hint: "Use a queue (BFS). Process all nodes at each level before moving to next.",
    approach: ["Start with root in queue", "While queue not empty: process all nodes at current level", "Add their children to queue for next level"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 45, title: "Binary Tree Right Side View", topic: "Tree", difficulty: "medium",
    companies: ["Facebook", "Amazon"],
    description: "Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.",
    hint: "BFS level order traversal — the last node at each level is visible from the right side.",
    approach: ["BFS level by level", "At each level, record the last node's value", "That's the right side view for that level"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 46, title: "Lowest Common Ancestor of BST", topic: "Tree", difficulty: "medium",
    companies: ["Amazon", "Facebook", "Microsoft"],
    description: "Given a binary search tree (BST), find the lowest common ancestor (LCA) of two given nodes in the BST.",
    hint: "Leverage BST property — if both p and q are smaller than root, go left; if both larger, go right; else root is LCA.",
    approach: ["If p.val < root.val AND q.val < root.val → go left", "If p.val > root.val AND q.val > root.val → go right", "Else root is the LCA"],
    time: "O(h)", space: "O(1)"
  },
  {
    id: 47, title: "Path Sum II", topic: "Tree", difficulty: "medium",
    companies: ["Amazon", "Facebook"],
    description: "Given the root of a binary tree and an integer targetSum, return all root-to-leaf paths where the sum of the node values in the path equals targetSum.",
    hint: "DFS backtracking — add node to path, recurse, then remove on backtrack.",
    approach: ["DFS with current path and remaining sum", "At leaf: if remaining == 0, add path to result", "Backtrack by removing last element"],
    time: "O(n²)", space: "O(n)"
  },
  {
    id: 48, title: "Diameter of Binary Tree", topic: "Tree", difficulty: "easy",
    companies: ["Facebook", "Google", "Amazon"],
    description: "Given the root of a binary tree, return the length of the diameter of the tree. The diameter of a binary tree is the length of the longest path between any two nodes in a tree.",
    hint: "For each node, diameter through it = leftDepth + rightDepth. Track global max.",
    approach: ["DFS to compute height", "At each node: update maxDiameter = max(maxDiameter, leftH + rightH)", "Return max height to parent"],
    time: "O(n)", space: "O(h)"
  },
  {
    id: 49, title: "Construct Binary Tree from Preorder and Inorder", topic: "Tree", difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    description: "Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.",
    hint: "Preorder's first element is always root. Find root in inorder to split left and right subtrees.",
    approach: ["Root = preorder[0]", "Find root index in inorder to determine left/right sizes", "Recursively build left and right subtrees"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 50, title: "Binary Tree Maximum Path Sum", topic: "Tree", difficulty: "hard",
    companies: ["Facebook", "Amazon", "Google"],
    description: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. The path does not need to pass through the root. Given the root, return the maximum path sum of any non-empty path.",
    hint: "For each node, compute max path through it = node.val + max(0, leftGain) + max(0, rightGain). Update global max.",
    approach: ["DFS returning max gain through each node", "At each node: maxPath = node.val + max(0,leftGain) + max(0,rightGain)", "Update global max; return node.val + max single branch gain"],
    time: "O(n)", space: "O(h)"
  },
  {
    id: 51, title: "Serialize and Deserialize Binary Tree", topic: "Tree", difficulty: "hard",
    companies: ["Facebook", "Google", "Amazon"],
    description: "Design an algorithm to serialize and deserialize a binary tree. Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored or reconstructed.",
    hint: "Use preorder traversal. Use a special marker (like '#') for null nodes.",
    approach: ["Serialize: preorder DFS, write 'null' for missing nodes", "Deserialize: split by delimiter, rebuild using preorder with a queue/index", "Track position in serialized array"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 52, title: "Kth Smallest Element in BST", topic: "Tree", difficulty: "medium",
    companies: ["Amazon", "LinkedIn", "Google"],
    description: "Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
    hint: "Inorder traversal of BST gives sorted order. Return kth element visited.",
    approach: ["Inorder traversal (left → root → right)", "Count visited nodes", "Return node value when count reaches k"],
    time: "O(h+k)", space: "O(h)"
  },
  {
    id: 53, title: "Symmetric Tree", topic: "Tree", difficulty: "easy",
    companies: ["Amazon", "Microsoft", "LinkedIn"],
    description: "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
    hint: "Recursively check if left.left mirrors right.right AND left.right mirrors right.left.",
    approach: ["Helper: isMirror(left, right)", "Base: both null → true; one null → false", "Check: left.val == right.val AND isMirror(l.left, r.right) AND isMirror(l.right, r.left)"],
    time: "O(n)", space: "O(h)"
  },
  {
    id: 54, title: "Count Good Nodes in Binary Tree", topic: "Tree", difficulty: "medium",
    companies: ["Facebook"],
    description: "Given a binary tree root, a node X in the tree is named good if in the path from root to X there are no nodes with a value greater than X's value. Return the number of good nodes in the binary tree.",
    hint: "DFS passing the max value seen so far from root. If current node ≥ max, it's a good node.",
    approach: ["DFS with running maxSoFar", "If node.val >= maxSoFar, increment count", "Update maxSoFar for children's calls"],
    time: "O(n)", space: "O(h)"
  },
  {
    id: 55, title: "Word Search (Grid DFS)", topic: "Tree", difficulty: "medium",
    companies: ["Amazon", "Microsoft", "Bloomberg"],
    description: "Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring.",
    hint: "DFS + backtracking — mark cell as visited, explore all 4 directions, unmark on return.",
    approach: ["For each cell matching word[0], start DFS", "Mark current cell as visited ('*'), recurse on 4 neighbors", "Restore cell after backtrack"],
    time: "O(m*n*4^L)", space: "O(L)"
  },

  // ===== DYNAMIC PROGRAMMING (56-72) =====
  {
    id: 56, title: "Climbing Stairs", topic: "DP", difficulty: "easy",
    companies: ["Amazon", "Google", "Adobe"],
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    hint: "Classic Fibonacci. dp[i] = dp[i-1] + dp[i-2].",
    approach: ["dp[1] = 1, dp[2] = 2", "dp[i] = dp[i-1] + dp[i-2]", "Space optimized: use two variables"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 57, title: "House Robber", topic: "DP", difficulty: "medium",
    companies: ["Amazon", "Airbnb", "Lyft"],
    description: "You are a professional robber planning to rob houses along a street. Adjacent houses have security systems connected. Given an integer array nums, return the maximum amount of money you can rob without alerting the police.",
    hint: "dp[i] = max(dp[i-1], dp[i-2] + nums[i]).",
    approach: ["dp[i] = max(rob this house + dp[i-2], skip dp[i-1])", "Only need prev two values → O(1) space", "Base cases: dp[0]=nums[0], dp[1]=max(nums[0], nums[1])"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 58, title: "Coin Change", topic: "DP", difficulty: "medium",
    companies: ["Amazon", "Google", "Microsoft"],
    description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins needed to make up that amount. If that amount cannot be achieved, return -1.",
    hint: "dp[amount] = min coins to make 'amount'. Bottom up from 0 to amount.",
    approach: ["dp[0] = 0, dp[i] = infinity initially", "For each amount, try all coins: dp[i] = min(dp[i], dp[i-coin]+1)", "Return dp[amount] or -1 if infinity"],
    time: "O(amount * coins)", space: "O(amount)"
  },
  {
    id: 59, title: "Longest Increasing Subsequence", topic: "DP", difficulty: "medium",
    companies: ["Amazon", "Microsoft", "Google"],
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    hint: "dp[i] = length of LIS ending at index i. For each i, check all j < i where nums[j] < nums[i].",
    approach: ["dp[i] = max(dp[j]+1) for all j<i where nums[j]<nums[i]", "dp[i] starts at 1 (just element itself)", "Answer is max of all dp[i]"],
    time: "O(n²)", space: "O(n)"
  },
  {
    id: 60, title: "0/1 Knapsack", topic: "DP", difficulty: "medium",
    companies: ["Amazon", "Google", "Microsoft"],
    description: "Given weights and values of n items, put these items in a knapsack of capacity W to get the maximum total value. Each item can only be used once.",
    hint: "2D DP table dp[i][w] = max value using first i items with capacity w.",
    approach: ["dp[i][w] = max(exclude item i: dp[i-1][w], include: dp[i-1][w-weight[i]] + value[i])", "Only include if weight[i] <= w", "Can optimize to 1D DP (iterate w backward)"],
    time: "O(n*W)", space: "O(n*W)"
  },
  {
    id: 61, title: "Unique Paths", topic: "DP", difficulty: "medium",
    companies: ["Amazon", "Google", "Bloomberg"],
    description: "There is a robot on an m x n grid. The robot is initially located at the top-left corner. The robot can only move either down or right at any point in time. Return the number of possible unique paths to reach the bottom-right corner.",
    hint: "dp[i][j] = dp[i-1][j] + dp[i][j-1]. First row and column are all 1s.",
    approach: ["dp[i][j] = paths from top + paths from left", "Initialize first row and column to 1", "Fill rest of DP table"],
    time: "O(m*n)", space: "O(m*n)"
  },
  {
    id: 62, title: "Longest Common Subsequence", topic: "DP", difficulty: "medium",
    companies: ["Amazon", "Google", "Microsoft"],
    description: "Given two strings text1 and text2, return the length of their longest common subsequence. A subsequence is a sequence that can be derived from another sequence by deleting some or no elements.",
    hint: "dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1]. If chars match: dp[i-1][j-1]+1.",
    approach: ["If text1[i-1] == text2[j-1]: dp[i][j] = dp[i-1][j-1] + 1", "Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])", "Answer at dp[m][n]"],
    time: "O(m*n)", space: "O(m*n)"
  },
  {
    id: 63, title: "Edit Distance", topic: "DP", difficulty: "hard",
    companies: ["Google", "Amazon", "Microsoft"],
    description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have three operations permitted on a word: Insert, Delete, Replace a character.",
    hint: "dp[i][j] = min edits to convert word1[0..i-1] to word2[0..j-1].",
    approach: ["If chars match: dp[i][j] = dp[i-1][j-1]", "Else: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) for delete, insert, replace", "Base cases: empty strings"],
    time: "O(m*n)", space: "O(m*n)"
  },
  {
    id: 64, title: "Word Break", topic: "DP", difficulty: "medium",
    companies: ["Amazon", "Google", "Facebook"],
    description: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
    hint: "dp[i] = true if s[0..i-1] can be segmented. Check all valid last words.",
    approach: ["dp[0] = true (empty string)", "For each i, check all j < i: if dp[j] && s[j..i] in dict → dp[i] = true", "Return dp[n]"],
    time: "O(n² * m)", space: "O(n)"
  },
  {
    id: 65, title: "Partition Equal Subset Sum", topic: "DP", difficulty: "medium",
    companies: ["Facebook", "Amazon"],
    description: "Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal.",
    hint: "Reduce to 0/1 knapsack: can we achieve sum/2? Use a boolean DP array.",
    approach: ["If total sum is odd, return false", "Target = sum/2; dp[0] = true", "For each num, update dp backward: dp[j] |= dp[j-num]"],
    time: "O(n * sum)", space: "O(sum)"
  },
  {
    id: 66, title: "Maximum Product Subarray", topic: "DP", difficulty: "medium",
    companies: ["Amazon", "LinkedIn", "Google"],
    description: "Given an integer array nums, find a subarray that has the largest product, and return the product.",
    hint: "Track both max and min product ending at current position (negative × negative = positive).",
    approach: ["Track curMax and curMin (negatives flip sign)", "At each step: newMax = max(num, curMax*num, curMin*num)", "Update global maxProduct"],
    time: "O(n)", space: "O(1)"
  },
  {
    id: 67, title: "Palindrome Partitioning", topic: "DP", difficulty: "medium",
    companies: ["Facebook", "Amazon"],
    description: "Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s.",
    hint: "Backtracking — at each position, try all substrings starting there, add to path if palindrome.",
    approach: ["DFS backtracking with current start index and path", "For each end index, if s[start..end] is palindrome, recurse with end+1", "Add path to result when start == s.length"],
    time: "O(n * 2^n)", space: "O(n)"
  },
  {
    id: 68, title: "Burst Balloons", topic: "DP", difficulty: "hard",
    companies: ["Google", "Amazon"],
    description: "You are given n balloons, indexed from 0 to n - 1. Each balloon is painted with a number on it represented by an array nums. You are asked to burst all the balloons. Return the maximum coins you can collect.",
    hint: "Interval DP — think of the LAST balloon to burst in each interval, not first.",
    approach: ["Add 1s at both ends of array", "dp[i][j] = max coins bursting all balloons between i and j (exclusive)", "Try each k as the LAST balloon burst in [i,j]: dp[i][k] + nums[i]*nums[k]*nums[j] + dp[k][j]"],
    time: "O(n³)", space: "O(n²)"
  },
  {
    id: 69, title: "Regular Expression Matching", topic: "DP", difficulty: "hard",
    companies: ["Facebook", "Google", "Amazon"],
    description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'. '.' matches any single character, '*' matches zero or more of the preceding element.",
    hint: "2D DP where dp[i][j] = true if s[0..i-1] matches p[0..j-1].",
    approach: ["dp[0][0] = true (both empty)", "Handle '*' matching zero occurrences: dp[i][j] |= dp[i][j-2]", "Handle '*' matching one more: if char matches, dp[i][j] |= dp[i-1][j]"],
    time: "O(m*n)", space: "O(m*n)"
  },
  {
    id: 70, title: "Stock Buy Sell (at most k transactions)", topic: "DP", difficulty: "hard",
    companies: ["Amazon", "Google"],
    description: "You are given an integer array prices and an integer k. Find the maximum profit you can achieve with at most k transactions. You may not engage in multiple transactions simultaneously.",
    hint: "dp[k][i] = max profit with at most k transactions up to day i.",
    approach: ["dp[t][i] = max(dp[t][i-1], max over j<i of prices[i]-prices[j]+dp[t-1][j])", "Optimize with running max of (dp[t-1][j]-prices[j])", "O(kn) time"],
    time: "O(k*n)", space: "O(k*n)"
  },
  {
    id: 71, title: "Wildcard Matching", topic: "DP", difficulty: "hard",
    companies: ["Facebook", "Google"],
    description: "Given an input string s and a pattern p, implement wildcard pattern matching with support for '?' and '*'. '?' matches any single character, '*' matches any sequence of characters (including empty).",
    hint: "2D DP. '*' can match empty (dp[i][j] = dp[i][j-1]) or one more char (dp[i][j] = dp[i-1][j]).",
    approach: ["dp[i][j] = s[0..i-1] matches p[0..j-1]", "If p[j-1]=='*': dp[i][j] = dp[i][j-1] || dp[i-1][j]", "If match or '?': dp[i][j] = dp[i-1][j-1]"],
    time: "O(m*n)", space: "O(m*n)"
  },
  {
    id: 72, title: "Triangle Minimum Path Sum", topic: "DP", difficulty: "medium",
    companies: ["Amazon", "Microsoft"],
    description: "Given a triangle array, return the minimum path sum from top to bottom. For each step, you may move to an adjacent number of the row below.",
    hint: "Bottom-up DP. For each row from bottom-1 upward: dp[j] += min(dp[j], dp[j+1]).",
    approach: ["Start from second-last row", "dp[j] = triangle[i][j] + min(dp[j], dp[j+1])", "Return dp[0] after processing all rows"],
    time: "O(n²)", space: "O(n)"
  },

  // ===== GRAPHS (73-84) =====
  {
    id: 73, title: "Number of Islands", topic: "Graph", difficulty: "medium",
    companies: ["Amazon", "Facebook", "Google"],
    description: "Given an m x n 2D binary grid representing a map of '1's (land) and '0's (water), return the number of islands.",
    hint: "DFS from each unvisited '1' cell — flood fill all connected land to avoid counting twice.",
    approach: ["Scan grid; when '1' found, increment count", "DFS from that cell, marking all connected '1's as '0' (visited)", "Count number of DFS calls from main loop"],
    time: "O(m*n)", space: "O(m*n)"
  },
  {
    id: 74, title: "Clone Graph", topic: "Graph", difficulty: "medium",
    companies: ["Facebook", "Amazon"],
    description: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node contains a value and a list of its neighbors.",
    hint: "BFS/DFS with a hash map from original node to its clone to handle cycles.",
    approach: ["HashMap<Node, Node> cloned", "DFS: if node already in map, return clone", "Create new node, add to map, recursively clone all neighbors"],
    time: "O(V+E)", space: "O(V)"
  },
  {
    id: 75, title: "Course Schedule (Cycle Detection)", topic: "Graph", difficulty: "medium",
    companies: ["Facebook", "Amazon", "Uber"],
    description: "There are numCourses courses. Some courses have prerequisites. Given an array prerequisites, determine if you can finish all courses. (Detect cycle in directed graph.)",
    hint: "Topological sort (Kahn's algorithm) or DFS cycle detection with 3-color marking.",
    approach: ["Build adjacency list and in-degree array", "BFS: start with nodes of in-degree 0", "If all nodes processed (count == numCourses), no cycle → return true"],
    time: "O(V+E)", space: "O(V+E)"
  },
  {
    id: 76, title: "Pacific Atlantic Water Flow", topic: "Graph", difficulty: "medium",
    companies: ["Facebook", "Google"],
    description: "Given an m x n matrix of non-negative integers representing the height of each unit cell, return a list of grid coordinates where water can flow to both the Pacific and Atlantic ocean.",
    hint: "Reverse BFS — start from ocean borders and find all cells that can reach each ocean.",
    approach: ["BFS/DFS from all Pacific-border cells; mark reachable", "BFS/DFS from all Atlantic-border cells; mark reachable", "Return intersection of both sets"],
    time: "O(m*n)", space: "O(m*n)"
  },
  {
    id: 77, title: "Surrounded Regions", topic: "Graph", difficulty: "medium",
    companies: ["Google", "Amazon"],
    description: "Given an m x n matrix board containing 'X' and 'O', capture all regions that are 4-directionally surrounded by 'X'. A region is not captured if it's connected to the border.",
    hint: "DFS from border 'O' cells to mark safe ones. Flip all unmarked 'O' to 'X'.",
    approach: ["DFS from all 'O' cells on the border, mark as 'S' (safe)", "Flip remaining 'O' to 'X'", "Flip 'S' back to 'O'"],
    time: "O(m*n)", space: "O(m*n)"
  },
  {
    id: 78, title: "Word Ladder", topic: "Graph", difficulty: "hard",
    companies: ["Amazon", "Facebook", "LinkedIn"],
    description: "Given two words beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord. Each transformed word must exist in the word list.",
    hint: "BFS treating each word as a node. Neighbors differ by exactly one character.",
    approach: ["BFS from beginWord", "For each word in queue, try replacing each character with a-z", "If new word in wordList, add to queue; track visited"],
    time: "O(M² * N)", space: "O(M² * N)"
  },
  {
    id: 79, title: "Alien Dictionary", topic: "Graph", difficulty: "hard",
    companies: ["Facebook", "Google", "Airbnb"],
    description: "Given a sorted list of words from an alien language, determine the order of characters in that language. Return any valid ordering, or empty string if none exists.",
    hint: "Compare adjacent words to extract character ordering edges, then topological sort.",
    approach: ["Compare adjacent words to find char ordering pairs (edges)", "Build graph and run topological sort (Kahn's BFS)", "If cycle found (ordering inconsistent), return empty string"],
    time: "O(C) where C = total chars", space: "O(1) (26 chars only)"
  },
  {
    id: 80, title: "Dijkstra's Shortest Path", topic: "Graph", difficulty: "medium",
    companies: ["Google", "Amazon", "Microsoft"],
    description: "Given a weighted directed graph, find the shortest path from source to all other vertices using Dijkstra's algorithm.",
    hint: "Use a min-heap (priority queue). Greedily process the node with smallest current distance.",
    approach: ["Initialize dist[] with infinity, dist[src]=0", "Min-heap with (dist, node)", "For each node popped, relax all edges; push updated neighbors"],
    time: "O((V+E) log V)", space: "O(V)"
  },
  {
    id: 81, title: "Rotting Oranges (Multi-source BFS)", topic: "Graph", difficulty: "medium",
    companies: ["Amazon", "Facebook", "Google"],
    description: "You are given an m x n grid where each cell can be 0 (empty), 1 (fresh orange), or 2 (rotten orange). Every minute, any fresh orange 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes until no fresh orange remains.",
    hint: "Multi-source BFS — start from all rotten oranges simultaneously.",
    approach: ["Add all initially rotten oranges to BFS queue", "BFS level by level (each level = 1 minute)", "Count minutes; return -1 if any fresh orange remains"],
    time: "O(m*n)", space: "O(m*n)"
  },
  {
    id: 82, title: "Network Delay Time (Bellman-Ford)", topic: "Graph", difficulty: "medium",
    companies: ["Google", "Amazon"],
    description: "You are given a network of n nodes, labeled from 1 to n. You are also given times, a list of travel times as directed edges. Find the minimum time it takes for all nodes to receive the signal sent from a given source node k.",
    hint: "Dijkstra from k; answer is max of all shortest distances. If any node unreachable, return -1.",
    approach: ["Dijkstra from source k", "Find max of all dist[] values", "If max is infinity, return -1"],
    time: "O((V+E) log V)", space: "O(V+E)"
  },
  {
    id: 83, title: "Find if Path Exists in Graph", topic: "Graph", difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    description: "There is a bi-directional graph with n vertices. Given edges and source/destination, return true if there is a valid path from source to destination.",
    hint: "Simple BFS or DFS from source. Or Union-Find to check if source and destination are in same component.",
    approach: ["BFS/DFS from source", "Mark visited nodes", "Return true if destination is reached"],
    time: "O(V+E)", space: "O(V+E)"
  },
  {
    id: 84, title: "Minimum Spanning Tree (Kruskal's)", topic: "Graph", difficulty: "medium",
    companies: ["Google", "Amazon", "Microsoft"],
    description: "Given a connected weighted undirected graph, find the minimum spanning tree (MST) using Kruskal's algorithm.",
    hint: "Sort edges by weight. Use Union-Find to add edges without creating cycles.",
    approach: ["Sort all edges by weight", "For each edge (u,v): if find(u) != find(v), include edge and union them", "Stop after V-1 edges selected"],
    time: "O(E log E)", space: "O(V)"
  },

  // ===== STACK & QUEUE (85-90) =====
  {
    id: 85, title: "Min Stack", topic: "Stack", difficulty: "medium",
    companies: ["Amazon", "Google", "Bloomberg"],
    description: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
    hint: "Use two stacks — one regular, one tracking minimums. The min stack only pushes when new min is found.",
    approach: ["Main stack for all elements", "Min stack: push if new element <= current min", "getMin() = top of min stack"],
    time: "O(1) all operations", space: "O(n)"
  },
  {
    id: 86, title: "Evaluate Reverse Polish Notation", topic: "Stack", difficulty: "medium",
    companies: ["Amazon", "LinkedIn"],
    description: "Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, and /. Each operand may be an integer or another expression.",
    hint: "Use a stack. Push numbers; on operator, pop two operands, compute, push result.",
    approach: ["Iterate tokens", "If number: push to stack", "If operator: pop two, apply operator, push result; return stack.top()"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 87, title: "Daily Temperatures", topic: "Stack", difficulty: "medium",
    companies: ["Amazon", "Google", "Facebook"],
    description: "Given an array of integers temperatures representing daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.",
    hint: "Monotonic decreasing stack — store indices. When a warmer temperature is found, resolve all cooler temperatures in the stack.",
    approach: ["Maintain stack of indices with decreasing temperatures", "For each day, while stack not empty and temp > stack top: pop and compute wait", "Push current index"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 88, title: "Largest Rectangle in Histogram", topic: "Stack", difficulty: "hard",
    companies: ["Amazon", "Google", "Microsoft"],
    description: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
    hint: "Monotonic increasing stack. When a shorter bar is found, calculate area with each taller bar in stack.",
    approach: ["Maintain stack of indices with increasing heights", "When heights[i] < stack top, pop and calculate area", "Width = i - stack.peek() - 1 (or i if stack empty)"],
    time: "O(n)", space: "O(n)"
  },
  {
    id: 89, title: "Sliding Window Maximum", topic: "Stack", difficulty: "hard",
    companies: ["Amazon", "Google", "Uber"],
    description: "You are given an integer array nums and an integer k. There is a sliding window of size k which is moving from the very left to the right. Return the max sliding window.",
    hint: "Monotonic decreasing deque — front is always the index of max element in current window.",
    approach: ["Use a deque storing indices", "Remove elements out of window (from front)", "Remove elements smaller than current from back", "Front of deque is max"],
    time: "O(n)", space: "O(k)"
  },
  {
    id: 90, title: "Implement Queue using Stacks", topic: "Stack", difficulty: "easy",
    companies: ["Amazon", "Microsoft"],
    description: "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue.",
    hint: "Two stacks: inbox and outbox. Move all from inbox to outbox (reversing) only when outbox is empty.",
    approach: ["push: push to stack1 (inbox)", "pop/peek: if stack2 empty, move all from stack1 to stack2", "Pop from stack2 (outbox)"],
    time: "O(1) amortized", space: "O(n)"
  },

  // ===== BINARY SEARCH (91-94) =====
  {
    id: 91, title: "Binary Search", topic: "Binary Search", difficulty: "easy",
    companies: ["Amazon", "Google", "Facebook"],
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.",
    hint: "Classic binary search. Keep left and right pointers, check mid each iteration.",
    approach: ["left=0, right=n-1", "mid = left + (right-left)/2 (avoids overflow)", "If nums[mid]==target return mid; if less go right half; else left half"],
    time: "O(log n)", space: "O(1)"
  },
  {
    id: 92, title: "Search a 2D Matrix", topic: "Binary Search", difficulty: "medium",
    companies: ["Amazon", "Microsoft", "Apple"],
    description: "Write an efficient algorithm that searches for a value target in an m x n integer matrix. The matrix has each row sorted, and the first integer of each row is greater than the last of the previous row.",
    hint: "Treat the 2D matrix as a flat sorted array. Use standard binary search with index conversion.",
    approach: ["Virtual array of size m*n", "mid = (left+right)/2; map to (mid/n, mid%n)", "Compare matrix[row][col] with target"],
    time: "O(log(m*n))", space: "O(1)"
  },
  {
    id: 93, title: "Median of Two Sorted Arrays", topic: "Binary Search", difficulty: "hard",
    companies: ["Google", "Amazon", "Facebook"],
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).",
    hint: "Binary search on partition of smaller array. Balance elements on each side.",
    approach: ["Binary search partition point of smaller array", "Partition larger array to maintain total elements equal on each side", "Find correct partition: maxLeft <= minRight on both sides"],
    time: "O(log(min(m,n)))", space: "O(1)"
  },
  {
    id: 94, title: "Koko Eating Bananas", topic: "Binary Search", difficulty: "medium",
    companies: ["Facebook", "Google"],
    description: "Koko can decide her bananas-per-hour eating speed k. She wants to eat all the bananas within h hours. Return the minimum integer k such that she can eat all the bananas within h hours.",
    hint: "Binary search on the answer (speed). Check if given speed k finishes within h hours.",
    approach: ["Binary search k from 1 to max(piles)", "For each k, compute hours needed = sum(ceil(pile/k))", "Find minimum k where hours <= h"],
    time: "O(n log m)", space: "O(1)"
  },

  // ===== RECURSION / BACKTRACKING (95-98) =====
  {
    id: 95, title: "Subsets", topic: "Recursion", difficulty: "medium",
    companies: ["Facebook", "Amazon", "Bloomberg"],
    description: "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
    hint: "Backtracking — at each index, choose to include or exclude the element.",
    approach: ["DFS with start index and current subset", "Add current subset to result at each call", "For each index from start, include element, recurse, then backtrack"],
    time: "O(n * 2^n)", space: "O(n)"
  },
  {
    id: 96, title: "Permutations", topic: "Recursion", difficulty: "medium",
    companies: ["Microsoft", "Amazon", "LinkedIn"],
    description: "Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.",
    hint: "Backtracking with a 'used' array. At each step, pick an unused number, mark it, recurse, unmark.",
    approach: ["DFS with current permutation and used[] boolean array", "At each step, try all unused numbers", "When permutation is complete (size n), add to result"],
    time: "O(n * n!)", space: "O(n)"
  },
  {
    id: 97, title: "Combination Sum", topic: "Recursion", difficulty: "medium",
    companies: ["Amazon", "Google", "Facebook"],
    description: "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations where the chosen numbers sum to target. The same number may be chosen unlimited number of times.",
    hint: "Backtracking — try each candidate from current index onward (allow reuse). Backtrack when sum exceeds target.",
    approach: ["DFS with start index and remaining target", "For each candidate from start: subtract from target, recurse (same index, allow reuse)", "Add to result when remaining == 0"],
    time: "O(n^(T/M))", space: "O(T/M)"
  },
  {
    id: 98, title: "N-Queens", topic: "Recursion", difficulty: "hard",
    companies: ["Amazon", "Microsoft", "Google"],
    description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions to the n-queens puzzle.",
    hint: "Backtracking row by row. Use sets to track occupied columns and diagonals.",
    approach: ["Place one queen per row", "Track cols, diag1 (r-c), diag2 (r+c) as sets", "If no conflict, place queen and recurse to next row; backtrack"],
    time: "O(n!)", space: "O(n)"
  },

  // ===== HASHING & MATH (99-100) =====
  {
    id: 99, title: "Happy Number", topic: "Hashing", difficulty: "easy",
    companies: ["Amazon", "Google"],
    description: "Write an algorithm to determine if a number n is happy. A happy number is a number defined by the following process: replace the number by the sum of the squares of its digits, and repeat until the number equals 1 (where it will stay), or it loops endlessly in a cycle.",
    hint: "Use a HashSet to detect cycles. Or use Floyd's cycle detection — slow and fast pointers on the sequence.",
    approach: ["Slow and fast pointers on digit-square sequence", "If slow == 1 or fast == 1 → happy", "If slow == fast (but not 1) → cycle → not happy"],
    time: "O(log n)", space: "O(1)"
  },
  {
    id: 100, title: "Pow(x, n) — Fast Exponentiation", topic: "Math", difficulty: "medium",
    companies: ["Facebook", "Google", "Amazon"],
    description: "Implement pow(x, n), which calculates x raised to the power n (i.e., xⁿ). Handle both positive and negative n.",
    hint: "Divide and conquer: if n is even, pow(x,n) = pow(x, n/2)^2. If odd, multiply by x once more.",
    approach: ["If n < 0: x = 1/x, n = -n", "If n is even: return pow(x*x, n/2)", "If odd: return x * pow(x*x, n/2)"],
    time: "O(log n)", space: "O(log n)"
  }
];

// ===== STATE =====
let statuses = JSON.parse(localStorage.getItem('codingStatuses') || '{}');
let currentQuestionId = null;
let filtered = [...QUESTIONS];

// ===== RENDER =====
function render() {
  const list = document.getElementById('questions-list');
  list.innerHTML = '';

  if (filtered.length === 0) {
    list.innerHTML = `<div style="padding:40px;text-align:center;color:var(--gray-400)">
      No questions match your filters. Try adjusting the search or filters.
    </div>`;
    return;
  }

  filtered.forEach((q, idx) => {
    const status = statuses[q.id] || 'unsolved';
    const row = document.createElement('div');
    row.className = 'question-row';
    row.onclick = () => openModal(q.id);

    const statusIcon = status === 'solved' ? '✅' : status === 'attempted' ? '⏳' : '○';
    const statusClass = status === 'solved' ? 'solved' : status === 'attempted' ? 'attempted' : '';

    row.innerHTML = `
      <div class="q-number">${q.id}</div>
      <div class="q-title">
        <span>${statusIcon}</span>
        <div>
          <div>${q.title}</div>
          <div class="q-company" style="margin-top:2px">${q.companies.slice(0,2).join(', ')}</div>
        </div>
      </div>
      <div><span class="q-topic">${q.topic}</span></div>
      <div><span class="difficulty-badge ${q.difficulty}">${q.difficulty.charAt(0).toUpperCase()+q.difficulty.slice(1)}</span></div>
      <div><span class="status-btn ${statusClass}">${status.charAt(0).toUpperCase()+status.slice(1)}</span></div>
      <div>
        <button class="btn-primary" style="padding:6px 12px;font-size:12px" onclick="event.stopPropagation();openModal(${q.id})">
          View →
        </button>
      </div>
    `;
    list.appendChild(row);
  });

  updateStats();
}

function updateStats() {
  const solved = Object.values(statuses).filter(s => s === 'solved').length;
  const attempted = Object.values(statuses).filter(s => s === 'attempted').length;
  const pct = Math.round((solved / 100) * 100);

  document.getElementById('solved-count').textContent = solved;
  document.getElementById('attempted-count').textContent = attempted;
  document.getElementById('accuracy-display').textContent = pct + '%';
  document.getElementById('progress-label').textContent = `${solved} / 100 solved`;
  document.getElementById('progress-fill').style.width = pct + '%';
}

// ===== FILTERS =====
function applyFilters() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const diff = document.getElementById('difficulty-filter').value;
  const topic = document.getElementById('topic-filter').value;
  const status = document.getElementById('status-filter').value;

  filtered = QUESTIONS.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search) ||
                        q.companies.some(c => c.toLowerCase().includes(search));
    const matchDiff = diff === 'all' || q.difficulty === diff;
    const matchTopic = topic === 'all' || q.topic === topic;
    const matchStatus = status === 'all' || (statuses[q.id] || 'unsolved') === status;
    return matchSearch && matchDiff && matchTopic && matchStatus;
  });

  render();
}

if (document.getElementById('search-input')) {
  document.getElementById('search-input').addEventListener('input', applyFilters);
  document.getElementById('difficulty-filter').addEventListener('change', applyFilters);
  document.getElementById('topic-filter').addEventListener('change', applyFilters);
  document.getElementById('status-filter').addEventListener('change', applyFilters);
}

// ===== MODAL =====
function openModal(id) {
  const q = QUESTIONS.find(q => q.id === id);
  if (!q) return;
  currentQuestionId = id;

  document.getElementById('modal-title').textContent = `${q.id}. ${q.title}`;

  document.getElementById('modal-meta').innerHTML = `
    <span class="difficulty-badge ${q.difficulty}">${q.difficulty.charAt(0).toUpperCase()+q.difficulty.slice(1)}</span>
    <span class="q-topic">${q.topic}</span>
    ${q.companies.map(c => `<span style="font-size:12px;padding:3px 8px;background:var(--gray-100);border-radius:6px;color:var(--gray-600)">${c}</span>`).join('')}
  `;

  document.getElementById('modal-description').textContent = q.description;
  document.getElementById('modal-hint').textContent = q.hint;

  const approachList = document.getElementById('modal-approach');
  approachList.innerHTML = q.approach.map(a => `<li>${a}</li>`).join('');

  document.getElementById('modal-complexity').innerHTML = `
    <span class="complexity-badge">⏱ Time: <strong>${q.time}</strong></span>
    <span class="complexity-badge">💾 Space: <strong>${q.space}</strong></span>
  `;

  // Update mark button state
  const status = statuses[id] || 'unsolved';
  const solveBtn = document.querySelector('.modal-actions .btn-primary');
  if (status === 'solved') {
    solveBtn.textContent = '✔ Solved!';
    solveBtn.style.background = 'var(--green)';
  } else {
    solveBtn.textContent = '✔ Mark as Solved';
    solveBtn.style.background = 'var(--purple)';
  }

  // Set "Start Coding" link
  const codeBtn = document.getElementById('btn-start-coding');
  if (codeBtn) {
    codeBtn.href = `solve.html?id=${q.id}`;
  }

  document.getElementById('modal-overlay').classList.add('show');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
  currentQuestionId = null;
}

function markSolved() {
  if (!currentQuestionId) return;
  statuses[currentQuestionId] = 'solved';
  saveAndRefresh();
  closeModal();
}

function markAttempted() {
  if (!currentQuestionId) return;
  if ((statuses[currentQuestionId] || '') !== 'solved') {
    statuses[currentQuestionId] = 'attempted';
  }
  saveAndRefresh();
  closeModal();
}

function saveAndRefresh() {
  localStorage.setItem('codingStatuses', JSON.stringify(statuses));
  applyFilters();
}

// Close modal on overlay click
if (document.getElementById('modal-overlay')) {
  document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
}

// ===== INIT =====
if (document.getElementById('questions-list')) {
  render();
}