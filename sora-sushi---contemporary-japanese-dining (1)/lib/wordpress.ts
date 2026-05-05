
export const fetchWordPressMenu = async () => {
  const query = `
    query GetMenuItems {
      dishes {
        nodes {
          id
          title
          menuItemDetails {
            price
            description
            category
          }
        }
      }
    }
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); 

    // ALWAYS use the server-side proxy
    const response = await fetch('/api/wordpress-proxy', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`WordPress Proxy responded with status ${response.status}. Using available items.`);
      return null;
    }

    const json = await response.json();
    const nodes = json.data?.dishes?.nodes || [];
    
    return nodes.map((node: any) => {
      const details = node.menuItemDetails || {};
      return {
        id: node.id || Math.random().toString(36).substr(2, 9),
        item_name: node.title,
        description: details.description || '',
        price: parseFloat(details.price || '0'),
        category: details.category || 'Omakase',
      };
    });
  } catch (error) {
    console.warn('Network error fetching from WordPress proxy. Using fallback.', error);
    return null;
  }
};
