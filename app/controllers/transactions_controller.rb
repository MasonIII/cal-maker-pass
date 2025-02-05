class TransactionsController < ApplicationController

  def index
    current_user = User.where(uid: session[:cas_user])[0]
    admin_user = Admin.find_by_user_id(current_user.id)
    get_trans_params
    #get_transactions
    if current_user.admin?
      @transactions = Transaction.all
    else
      @transactions = Transaction.where(user_id: current_user.id)
    end
    save_trans_params
  end

  def checkout
    items = params[:items]
    admin_user = User.where(uid: session[:cas_user])[0]
    admin = Admin.where(user_id: admin_user.id)[0]
    if admin.nil?
      admin = Admin.find(1)
    end
    buyer = User.find_by_sid(params[:buyer]);
    purpose = params[:purpose]
    tx = Transaction.new(:purpose=>purpose);
    tx.user = buyer
    tx.admin = admin
    tx.save
    item_array = []
    index = 0
    while index < items.length do
      cart_item = items[index.to_s]
      lineitem = LineItem.new(:action => "sold", :quantity => cart_item[1].to_i)
      actual_item = Item.where(:name => cart_item[0].to_s)[0]
      lineitem.item = actual_item
      lineitem.transaction = tx
      lineitem.save
      index += 1
    end
    session[:cart] = Cart.new
    render :nothing => true
  end

  def show
    @transaction = Transaction.find(params[:id])
    if not @user.admin? and @transaction.user_id != @user.id
      redirect_to action: "index"
    end
  end

  def sort
    get_trans_params
    get_transactions
    render 'trans_table'
    save_trans_params
  end

  def export
    @transactions = Transaction.all
    type = params[:type]
    file_ext = params[:file_ext]
    data = {
      Transactions: {
        CSV: Transaction.transactions_data(@transactions),
        XLS: Transaction.transactions_data(@transactions, col_sep: "\t")
      },
      Balances: {
        CSV: Transaction.balances_data,
        XLS: Transaction.balances_data(col_sep: "\t")
      }
    }
    respond_to do |format|
      format.html { send_data data[type.to_sym][file_ext.to_sym] }
    end  
  end

  private

  ## sorting logic

   # get @sort_trans_by, @sort_trans_type, @all, @admin_user
  def get_trans_params
=begin
    if should_find?
      @phrase = params[:phrase] || session[:phrase]
    else
      @phrase = nil
    end
=end
    if should_sort?
      @sort_trans_by = params[:sort_trans_by]
      @sort_trans_type = get_sort_trans_type
    elsif sorted_before?
      @sort_trans_by, @sort_trans_type = session[:sort_trans_by], session[:sort_trans_type]
    else
      @sort_trans_by, @sort_trans_type = nil, nil
    end
=begin
    if params[:page] || session[:page]
      @page = params[:page] || session[:page]
    else
      @page = 1
    end
=end
    @all = params[:all] || session[:all]
    @admin_user = params[:admin_user] || session[:admin_user]
  end
=begin
  def should_find?
    params.has_key?(:phrase) || session.has_key?(:phrase) # && !session[:phrase].nil?) 
  end
=end
  def should_sort?
    params.has_key?(:sort_trans_by)
  end

  def sorted_before?
    session.has_key?(:sort_trans_by) # && !session[:sort_trans_by].nil?
  end

  def get_sort_trans_type
    if !sorted_before?
      # accounts for first time sorting in current session
      @sort_trans_type = 'ascending'  
    elsif sorted_before? && (params[:sort_trans_by] == session[:sort_trans_by])
      # accounts for clicking an already sorted column to change the sort type (ascending <-> descending)
      session[:sort_trans_type] == 'ascending' ? (@sort_trans_type = 'descending') : (@sort_trans_type = 'ascending')
    elsif sorted_before? && (params[:sort_trans_by] != session[:sort_trans_by])
      # accounts for having sorted one column and now sorting a different column
      @sort_trans_type = 'ascending'
    end
  end

  # remember recent inventory conditions (filter & order)
  def save_trans_params
    #session[:phrase] = @phrase
    session[:sort_trans_by] = @sort_trans_by
    session[:sort_trans_type] = @sort_trans_type
    #session[:page] = @page
    session[:all] = @all
    session[:admin_user] = @admin_user
  end

  # get @transactions
  def get_transactions
    # according to search phrase
    #filter_transactions
    # according to sorting params
    @transactions = Transaction.all
    puts @sort_trans_by
    Transaction.sort(@transactions, @sort_trans_by, @sort_trans_type, @all, @admin_user)
  end

=begin
  def filter_transactions
    if @phrase.blank?  
      @items = Transaction.all
    else
      @items = Transaction.search(@phrase, fields: [{name: :word_start}], misspelling: {edit_distance: 2}, operator: "or").to_ary     
    end
  end

  def paginate_inv_items
      @transactions = Kaminari.paginate_array(@transactions).page(@page).per(20)
  end
=end

=begin
  def tx_helper(all, sort, admin_user)
    if (all == false && admin_user != nil) || (all == "false" && admin_user != nil)
      @transactions = self_tx_helper(sort, admin_user)
    elsif all == true || all == "true"
      @transactions = all_tx_helper(sort, admin_user)
    else
      @transactions = []
    end
  end

  def self_tx_helper(sort, admin_user)
    if sort == 'customer'
      @transactions = Transaction.where(admin_id: admin_user.id).includes(:user).order("users.last_name")
    elsif sort == 'purpose'
      @transactions = Transaction.where(admin_id: admin_user.id).order(:purpose)
    elsif sort == 'date'
      @transactions = Transaction.where(admin_id: admin_user.id).order(:created_at)
    else
      unless admin_user.nil?
        @transactions = Transaction.where(admin_id: admin_user.id)
      else
        @transactions = []
      end
    end
  end

  def all_tx_helper(sort, admin_user)
    if sort == 'customer'
      @transactions = Transaction.includes(:user).order("users.last_name")
    elsif sort == 'purpose'
      @transactions = Transaction.order(:purpose)
    elsif sort == 'date'
      @transactions = Transaction.order(:created_at)
    else
      @transactions = Transaction.all
    end
  end
=end

end
