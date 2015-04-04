Makerpass::Application.routes.draw do
  resources :items
  # resources :admins
  # resources :transactions

  get "/find" , to: "items#find", as: "find"
  get "/logout", to: "application#logout", as: "logout"

  #ITEM
  post "/items/:id/update", to: "items#update", as: "update_item"
  post "/items/:id/delete", to: "items#delete", as: "delete_item"
  post "/items/checkout", to: "items#checkout", as: "checkout"
  post "/items/add_item/:id", to: "items#add_item", as: "add_item"
end