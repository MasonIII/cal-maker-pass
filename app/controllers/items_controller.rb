class ItemsController < ApplicationController
    
    def index

      if params.has_key?(:sort)
        @sort = params[:sort]
        session[:sort] = params[:sort]
      elsif session.has_key?(:sort)
        @sort = session[:sort]
        need_redirect = true
      else
        @sort = nil
      end

      if @sort == 'name' 
        @items = Item.order(:name)
      elsif @sort == 'quantity' 
        @items = Item.order(:quantity)
      elsif @sort == 'price' 
        @items = Item.order(:price)
      elsif @sort == 'kind' 
        @items = Item.order(:kind)
      elsif @sort == 'status'
        @items = Item.order(:status)
      else
        @items = Item.all
      end

      @all_status = Item.all_status

      session[:cart] = session[:cart] || Hash.new
      @cart = []
      unless session[:cart].empty?
        puts session[:cart]
        session[:cart].each do |id, quantity|
          item = Item.find(id)
          @cart << {name: item.name, quantity: quantity}
        end
      end
    end

    def update
      @updated_data = params[:item]
      @item = Item.find(params[:id])
      @item.name = @updated_data[:name]
      @item.price = @updated_data[:price]
      @item.quantity = @updated_data[:quantity]
      @item.status = @updated_data[:status]
      @item.kind = @updated_data[:kind]
      @item.save!
      redirect_to item_path
    end

    def delete
      @item = Item.find(params[:id])
      @item.destroy
      redirect_to items_path
    end

    def show
      @item = Item.find(params[:id])
      @all_status = Item.all_status
    end

    def create
      @item = Item.new(params[:item])
      if @item.valid?
        @item.save
        flash[:notice] = "Successfully added item"
      else
        errors = @item.errors.full_messages.join("<br>").html_safe
        puts errors
        flash[:warning] = errors
      end
      redirect_to items_path
    end

    def checkout
       cart = params[:hash]
       puts cart
       # # user_id = params[:user] 
       # total = 0.0
       # for item in items
       #      # Call appropriate transaction function
       # end
       # flash[:notice] = "Successful transaction"
       redirect_to transactions_path(cart: cart)
    end

    def add_item
      @cart = session[:cart]
      @id = params[:id]
      if @cart.has_key? @id
        @cart[@id] += 1
      else
        @cart[@id] = 1
      end
      session[:cart] = @cart
      redirect_to items_path
    end

    def find
      @items = Item.search{ keywords params[:phrase]}.results
      @all_status = Item.all_status
      session[:cart] = session[:cart] || Hash.new
      @cart = []
      @sort = nil
      unless session[:cart].empty?
        puts session[:cart]
        session[:cart].each do |id, quantity|
          item = Item.find(id)
          @cart << {name: item.name, quantity: quantity}
        end
      end
      render :index
    end
end
