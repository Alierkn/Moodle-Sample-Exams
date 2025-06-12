/**
 * Example C++ code for Moodle Exam Simulator
 * This demonstrates a simple Binary Search Tree implementation
 */
#include <iostream>
#include <queue>
#include <string>

// Binary Search Tree Node
template <typename T>
class Node {
public:
    T data;
    Node* left;
    Node* right;
    
    Node(T value) : data(value), left(nullptr), right(nullptr) {}
};

// Binary Search Tree class
template <typename T>
class BinarySearchTree {
private:
    Node<T>* root;
    
    // Helper method for inserting a value
    Node<T>* insertHelper(Node<T>* node, T value) {
        if (node == nullptr) {
            return new Node<T>(value);
        }
        
        if (value < node->data) {
            node->left = insertHelper(node->left, value);
        } else if (value > node->data) {
            node->right = insertHelper(node->right, value);
        }
        
        return node;
    }
    
    // Helper method for searching a value
    bool searchHelper(Node<T>* node, T value) {
        if (node == nullptr) {
            return false;
        }
        
        if (node->data == value) {
            return true;
        }
        
        if (value < node->data) {
            return searchHelper(node->left, value);
        } else {
            return searchHelper(node->right, value);
        }
    }
    
    // Helper method for in-order traversal
    void inOrderHelper(Node<T>* node) {
        if (node != nullptr) {
            inOrderHelper(node->left);
            std::cout << node->data << " ";
            inOrderHelper(node->right);
        }
    }
    
    // Helper method for pre-order traversal
    void preOrderHelper(Node<T>* node) {
        if (node != nullptr) {
            std::cout << node->data << " ";
            preOrderHelper(node->left);
            preOrderHelper(node->right);
        }
    }
    
    // Helper method for post-order traversal
    void postOrderHelper(Node<T>* node) {
        if (node != nullptr) {
            postOrderHelper(node->left);
            postOrderHelper(node->right);
            std::cout << node->data << " ";
        }
    }
    
    // Helper method to find minimum value node
    Node<T>* findMinNode(Node<T>* node) {
        Node<T>* current = node;
        
        while (current && current->left != nullptr) {
            current = current->left;
        }
        
        return current;
    }
    
    // Helper method for deleting a node
    Node<T>* deleteNodeHelper(Node<T>* node, T value) {
        if (node == nullptr) {
            return nullptr;
        }
        
        if (value < node->data) {
            node->left = deleteNodeHelper(node->left, value);
        } else if (value > node->data) {
            node->right = deleteNodeHelper(node->right, value);
        } else {
            // Case 1: Leaf node (no children)
            if (node->left == nullptr && node->right == nullptr) {
                delete node;
                return nullptr;
            }
            // Case 2: Node with only one child
            else if (node->left == nullptr) {
                Node<T>* temp = node->right;
                delete node;
                return temp;
            } else if (node->right == nullptr) {
                Node<T>* temp = node->left;
                delete node;
                return temp;
            }
            // Case 3: Node with two children
            else {
                // Find inorder successor (smallest node in right subtree)
                Node<T>* temp = findMinNode(node->right);
                
                // Copy the inorder successor's data to this node
                node->data = temp->data;
                
                // Delete the inorder successor
                node->right = deleteNodeHelper(node->right, temp->data);
            }
        }
        
        return node;
    }
    
    // Helper method to free memory
    void destroyHelper(Node<T>* node) {
        if (node != nullptr) {
            destroyHelper(node->left);
            destroyHelper(node->right);
            delete node;
        }
    }
    
public:
    BinarySearchTree() : root(nullptr) {}
    
    ~BinarySearchTree() {
        destroyHelper(root);
    }
    
    // Insert a value into the tree
    void insert(T value) {
        root = insertHelper(root, value);
    }
    
    // Search for a value in the tree
    bool search(T value) {
        return searchHelper(root, value);
    }
    
    // Delete a value from the tree
    void remove(T value) {
        root = deleteNodeHelper(root, value);
    }
    
    // In-order traversal: Left -> Root -> Right
    void inOrderTraversal() {
        std::cout << "In-order traversal: ";
        inOrderHelper(root);
        std::cout << std::endl;
    }
    
    // Pre-order traversal: Root -> Left -> Right
    void preOrderTraversal() {
        std::cout << "Pre-order traversal: ";
        preOrderHelper(root);
        std::cout << std::endl;
    }
    
    // Post-order traversal: Left -> Right -> Root
    void postOrderTraversal() {
        std::cout << "Post-order traversal: ";
        postOrderHelper(root);
        std::cout << std::endl;
    }
    
    // Level-order traversal (Breadth-First Search)
    void levelOrderTraversal() {
        if (root == nullptr) {
            std::cout << "Tree is empty" << std::endl;
            return;
        }
        
        std::cout << "Level-order traversal: ";
        std::queue<Node<T>*> q;
        q.push(root);
        
        while (!q.empty()) {
            Node<T>* current = q.front();
            q.pop();
            
            std::cout << current->data << " ";
            
            if (current->left != nullptr) {
                q.push(current->left);
            }
            
            if (current->right != nullptr) {
                q.push(current->right);
            }
        }
        
        std::cout << std::endl;
    }
};

// Main function to demonstrate the Binary Search Tree
int main() {
    BinarySearchTree<int> bst;
    
    // Insert values
    bst.insert(50);
    bst.insert(30);
    bst.insert(70);
    bst.insert(20);
    bst.insert(40);
    bst.insert(60);
    bst.insert(80);
    
    // Display traversals
    std::cout << "Binary Search Tree Traversals:" << std::endl;
    bst.inOrderTraversal();
    bst.preOrderTraversal();
    bst.postOrderTraversal();
    bst.levelOrderTraversal();
    
    // Search for values
    int searchValue = 40;
    std::cout << "\nSearching for " << searchValue << ": " 
              << (bst.search(searchValue) ? "Found" : "Not found") << std::endl;
    
    searchValue = 55;
    std::cout << "Searching for " << searchValue << ": " 
              << (bst.search(searchValue) ? "Found" : "Not found") << std::endl;
    
    // Delete a value
    int deleteValue = 30;
    std::cout << "\nDeleting " << deleteValue << std::endl;
    bst.remove(deleteValue);
    
    // Display traversals after deletion
    std::cout << "\nAfter deletion:" << std::endl;
    bst.inOrderTraversal();
    bst.levelOrderTraversal();
    
    return 0;
}
