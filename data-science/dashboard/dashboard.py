import streamlit as st
import pandas as pd
import plotly.express as px
import statsmodels.api as sm

st.set_page_config(
    page_title="SiDoku Dashboard",
    page_icon="📊",
    layout="wide"
)

# custom css
st.markdown("""
<style>

body {
    background-color: #f8fafc;
}

.main {
    background-color: #f8fafc;
}

.block-container {
    padding-top: 1.5rem;
    padding-bottom: 2rem;
}

h1 {
    color: #0f172a;
    font-weight: 700;
}

h2, h3 {
    color: #1e293b;
}

p, label {
    color: #475569;
    font-size: 15px;
}

div[data-testid="metric-container"] {
    background-color: white;
    border: 1px solid #e2e8f0;
    padding: 18px;
    border-radius: 18px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}

section[data-testid="stSidebar"] {
    background-color: #f1f5f9;
}

.stAlert {
    border-radius: 14px;
}

</style>
""", unsafe_allow_html=True)

# load dataset
@st.cache_data
def load_data():

    df = pd.read_csv("data-science/data/wrangled_data.csv")

    df['date'] = pd.to_datetime(df['date'])

    df['sales'] = df['sales'].astype(int)

    df['revenue'] = df['sales'] * df['price']

    return df

df = load_data()

# sidebar
st.sidebar.title("📌 Filter Dashboard")

min_date = df['date'].min()
max_date = df['date'].max()

selected_date = st.sidebar.date_input(
    "Select Date Range",
    value=(),
    min_value=min_date,
    max_value=max_date
)

selected_promo = st.sidebar.selectbox(
    "Promo Status",
    ["All", "Promo", "Non Promo"]
)

# filtering data
if len(selected_date) == 2:

    start_date, end_date = selected_date

    filtered_df = df[
        (df['date'] >= pd.to_datetime(start_date)) &
        (df['date'] <= pd.to_datetime(end_date))
    ]

    if selected_promo == "Promo":
        filtered_df = filtered_df[filtered_df['promo'] == 1]

    elif selected_promo == "Non Promo":
        filtered_df = filtered_df[filtered_df['promo'] == 0]

else:
    filtered_df = pd.DataFrame()

# title
st.title("📊 SiDoku Business Analytics Dashboard")

st.caption(
    "Dashboard interaktif untuk membantu analisis penjualan, "
    "promo, dan performa produk pada UMKM retail."
)

st.markdown("---")

# empty state
if filtered_df.empty:
    st.info(
        "Silakan pilih rentang tanggal terlebih dahulu "
        "untuk menampilkan dashboard."
    )
    st.stop()

# kpi section
total_sales = filtered_df['sales'].sum()

total_revenue = filtered_df['revenue'].sum()

avg_sales = filtered_df['sales'].mean()

total_product = filtered_df['item_id'].nunique()

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric("Total Sales", f"{total_sales:,.0f}")

with col2:
    st.metric("Total Revenue", f"${total_revenue:,.0f}")

with col3:
    st.metric("Average Products per Transaction", f"{avg_sales:.0f}")

with col4:
    st.metric("Total Product", total_product)

st.info(
    f"Selama periode "
    f"{start_date.strftime('%d %b %Y')} hingga "
    f"{end_date.strftime('%d %b %Y')}, "
    f"total penjualan mencapai "
    f"{total_sales:,.0f} produk "
    f"dengan total revenue sebesar "
    f"${total_revenue:,.0f}. "
    f"Rata-rata transaksi menghasilkan sekitar "
    f"{avg_sales:.0f} produk yang terjual. "
    f"dalam satu kali transaksi, "
    f"dengan total {total_product} produk berbeda yang terjual."
)

st.markdown("---")

# sales distribution per item
st.subheader("📦 Distribusi Penjualan per Item")

item_sales = (
    filtered_df
    .groupby('item_id')['sales']
    .sum()
    .sort_values(ascending=True)
    .reset_index()
)

fig_item = px.bar(
    item_sales,
    x='sales',
    y='item_id',
    orientation='h',
    template='plotly_white',
    color='sales',
    color_continuous_scale='Blues'
)

fig_item.update_layout(
    xaxis_title="Total Products Sold",
    yaxis_title="Item ID",
    height=max(400, len(item_sales) * 22)
)

st.plotly_chart(fig_item, use_container_width=True)

top_item_name = item_sales.iloc[-1]['item_id']

top_item_sales = item_sales.iloc[-1]['sales']

bottom_item_name = item_sales.iloc[0]['item_id']

bottom_item_sales = item_sales.iloc[0]['sales']

st.success(
    f"Selama periode "
    f"{start_date.strftime('%d %b %Y')} hingga "
    f"{end_date.strftime('%d %b %Y')}, "
    f"{top_item_name} menjadi item paling laku dengan total "
    f"{top_item_sales:,.0f} produk terjual, "
    f"sedangkan {bottom_item_name} paling sepi dengan "
    f"{bottom_item_sales:,.0f} produk terjual. "
    f"Distribusi ini menunjukkan item mana yang paling diminati "
    f"pelanggan dan dapat menjadi dasar prioritas stok."
)

st.markdown("---")

# sales distribution
st.subheader("📊 Sales Distribution")

fig_dist = px.histogram(
    filtered_df,
    x='sales',
    nbins=40,
    template='plotly_white',
    color_discrete_sequence=['#3b82f6']
)

fig_dist.update_layout(
    xaxis_title="Products Sold per Transaction",
    yaxis_title="Frequency"
)

st.plotly_chart(fig_dist, use_container_width=True)

median_sales = filtered_df['sales'].median()

st.info(
    f"Selama periode "
    f"{start_date.strftime('%d %b %Y')} hingga "
    f"{end_date.strftime('%d %b %Y')}, "
    f"Sebagian besar transaksi mencatat penjualan sekitar "
    f"{median_sales:.0f} produk "
    f"dalam satu kali transaksi. "
    f"Hal ini menunjukkan bahwa pola pembelian pelanggan "
    f"cenderung stabil meskipun terdapat beberapa transaksi "
    f"dengan jumlah pembelian yang jauh lebih tinggi."
)

st.markdown("---")

# top product
st.subheader("🏆 Top Selling Products")

top_products = (
    filtered_df
    .groupby('item_id')['sales']
    .sum()
    .sort_values(ascending=False)
    .head(10)
    .reset_index()
)

fig_top = px.bar(
    top_products,
    x='item_id',
    y='sales',
    template='plotly_white',
    color='sales',
    color_continuous_scale='Blues'
)

fig_top.update_coloraxes(
    colorbar_tickformat=".0f"
)

fig_top.update_layout(
    xaxis_title="Product",
    yaxis_title="Total Products Sold"
)

st.plotly_chart(fig_top, use_container_width=True)

top_item = top_products.iloc[0]['item_id']

top_sales = top_products.iloc[0]['sales']

st.success(
    f"Selama periode "
    f"{start_date.strftime('%d %b %Y')} hingga "
    f"{end_date.strftime('%d %b %Y')}, "
    f"{top_item} menjadi produk dengan penjualan tertinggi "
    f"dengan total {top_sales:,.0f} produk terjual. "
    f"Hal ini menunjukkan bahwa produk tersebut memiliki "
    f"permintaan yang lebih tinggi dibanding produk lainnya."
)

st.markdown("---")

st.subheader("📉 Lowest Selling Products")

bottom_products = (
    filtered_df
    .groupby('item_id')['sales']
    .sum()
    .sort_values()
    .head(10)
    .reset_index()
)

fig_bottom = px.bar(
    bottom_products,
    x='item_id',
    y='sales',
    template='plotly_white',
    color='sales',
    color_continuous_scale='Reds'
)

fig_bottom.update_layout(
    xaxis_title="Product",
    yaxis_title="Total Products Sold"
)

st.plotly_chart(
    fig_bottom,
    use_container_width=True
)

bottom_item = bottom_products.iloc[0]['item_id']

bottom_sales = bottom_products.iloc[0]['sales']

st.warning(
    f"Selama periode "
    f"{start_date.strftime('%d %b %Y')} hingga "
    f"{end_date.strftime('%d %b %Y')}, "
    f"{bottom_item} menjadi produk dengan penjualan terendah "
    f"dengan total {bottom_sales:,.0f} produk terjual. "
    f"Hal ini menunjukkan bahwa permintaan terhadap produk tersebut "
    f"lebih rendah dibandingkan produk lainnya."
)

st.markdown("---")

# price vs sales
st.subheader("💰 Price vs Sales")

sample_size = min(3000, len(filtered_df))

fig_scatter = px.scatter(
    filtered_df.sample(sample_size),
    x='price',
    y='sales',
    opacity=0.6,
    template='plotly_white',
    trendline='ols',
    color_discrete_sequence=['#2563eb']
)

fig_scatter.update_layout(
    xaxis_title="Price",
    yaxis_title="Products Sold"
)

st.plotly_chart(fig_scatter, use_container_width=True)

correlation = filtered_df[['price', 'sales']].corr().iloc[0, 1]

st.info(
    f"Selama periode "
    f"{start_date.strftime('%d %b %Y')} hingga "
    f"{end_date.strftime('%d %b %Y')}, "
    f"nilai korelasi antara harga dan jumlah penjualan "
    f"adalah {correlation:.2f}. "
    f"Nilai ini menunjukkan bahwa hubungan antara harga "
    f"dan penjualan sangat lemah sehingga perubahan harga "
    f"tidak memiliki pengaruh yang berarti terhadap jumlah "
    f"produk yang terjual. Faktor lain seperti promo atau "
    f"karakteristik produk kemungkinan lebih berpengaruh "
    f"terhadap penjualan."
)

st.markdown("---")

# promo analysis
st.subheader("🎁 Promo Impact Analysis")

promo_analysis = (
    filtered_df
    .groupby('promo')['sales']
    .mean()
    .reset_index()
)

promo_analysis['promo'] = promo_analysis['promo'].map({
    0: 'Non Promo',
    1: 'Promo'
})

fig_promo = px.bar(
    promo_analysis,
    x='promo',
    y='sales',
    template='plotly_white',
    color='promo',
    color_discrete_sequence=['#94a3b8', '#2563eb']
)

fig_promo.update_layout(
    xaxis_title="Promo Category",
    yaxis_title="Average Products Sold"
)

st.plotly_chart(fig_promo, use_container_width=True)

promo_labels = promo_analysis['promo'].tolist()

if 'Promo' in promo_labels and 'Non Promo' in promo_labels:

    promo_avg = promo_analysis.loc[
        promo_analysis['promo'] == 'Promo',
        'sales'
    ].values[0]

    non_promo_avg = promo_analysis.loc[
        promo_analysis['promo'] == 'Non Promo',
        'sales'
    ].values[0]

    difference = (
        (promo_avg - non_promo_avg) / non_promo_avg
    ) * 100

    if difference > 0:

        st.success(
            f"Selama periode "
            f"{start_date.strftime('%d %b %Y')} hingga "
            f"{end_date.strftime('%d %b %Y')}, "
            f"produk yang menggunakan promo memiliki "
            f"rata-rata penjualan {difference:.1f}% "
            f"lebih tinggi dibanding produk non promo. "
            f"Hal ini menunjukkan bahwa strategi promo "
            f"cukup efektif dalam meningkatkan transaksi pelanggan."
        )

    else:

        st.warning(
            "Promo belum memberikan peningkatan "
            "penjualan yang signifikan."
        )

else:

    st.info(
        "Perbandingan promo dan non promo "
        "tidak dapat ditampilkan karena hanya "
        "terdapat satu kategori data."
    )

st.markdown("---")

# monthly pattern
st.subheader("🗓️ Monthly Sales Pattern")

filtered_df['year_month'] = (
    filtered_df['date']
    .dt.strftime('%b %Y')
)

monthly_sales = (
    filtered_df
    .groupby('year_month')['sales']
    .sum()
    .reset_index()
)

monthly_sales['sort_date'] = pd.to_datetime(
    monthly_sales['year_month'],
    format='%b %Y'
)

monthly_sales = monthly_sales.sort_values('sort_date')

fig_month = px.line(
    monthly_sales,
    x='year_month',
    y='sales',
    markers=True,
    template='plotly_white'
)

fig_month.update_traces(
    line_color='#2563eb'
)

fig_month.update_layout(
    xaxis_title="Period",
    yaxis_title="Total Products Sold"
)

st.plotly_chart(fig_month, use_container_width=True)

best_month = monthly_sales.loc[
    monthly_sales['sales'].idxmax(),
    'year_month'
]

best_month_sales = monthly_sales['sales'].max()

st.success(
    f"Selama periode "
    f"{start_date.strftime('%d %b %Y')} hingga "
    f"{end_date.strftime('%d %b %Y')}, "
    f"penjualan tertinggi terjadi pada periode "
    f"{best_month} dengan total "
    f"{best_month_sales:,.0f} produk terjual. "
    f"Hal ini menunjukkan adanya periode tertentu "
    f"dengan aktivitas transaksi yang lebih tinggi "
    f"dibanding bulan lainnya."
)

st.markdown("---")

# correlation heatmap
st.subheader("🔥 Correlation Heatmap")

heatmap_df = filtered_df[
    ['sales', 'price', 'promo', 'weekday', 'month']
]

corr_df = heatmap_df.corr()

fig_heatmap = px.imshow(
    corr_df.round(2),
    text_auto=True,
    aspect='auto',
    color_continuous_scale='Blues'
)

st.plotly_chart(fig_heatmap, use_container_width=True)

highest_corr = (
    corr_df['sales']
    .drop('sales')
    .abs()
    .idxmax()
)

highest_value = (
    corr_df['sales']
    .drop('sales')
    .abs()
    .max()
)

st.info(
    f"Selama periode "
    f"{start_date.strftime('%d %b %Y')} hingga "
    f"{end_date.strftime('%d %b %Y')}, "
    f"variabel {highest_corr} memiliki korelasi paling kuat "
    f"dengan penjualan dengan nilai sebesar "
    f"{highest_value:.2f}. "
    f"Dibandingkan variabel lainnya, faktor ini menunjukkan "
    f"hubungan yang paling besar terhadap perubahan jumlah "
    f"produk yang terjual dan dapat menjadi indikator awal "
    f"dalam memahami faktor yang memengaruhi performa penjualan."
)

st.markdown("---")

# outlier analysis
st.subheader("⚠️ Outlier Analysis")

fig_box = px.box(
    filtered_df,
    y='sales',
    template='plotly_white',
    color_discrete_sequence=['#2563eb']
)

fig_box.update_layout(
    yaxis_title="Products Sold"
)

st.plotly_chart(fig_box, use_container_width=True)

outlier_threshold = (
    filtered_df['sales']
    .quantile(0.99)
)

outlier_count = (
    filtered_df['sales']
    > outlier_threshold
).sum()

st.warning(
    f"Selama periode "
    f"{start_date.strftime('%d %b %Y')} hingga "
    f"{end_date.strftime('%d %b %Y')}, "
    f"terdapat sekitar {outlier_count} transaksi "
    f"dengan penjualan di atas "
    f"{outlier_threshold:.0f} produk "
    f"(persentil ke-99). "
    f"Transaksi ini dapat dipengaruhi oleh promo besar, "
    f"pembelian dalam jumlah banyak, atau periode dengan "
    f"permintaan yang sangat tinggi."
)

st.markdown("---")

# raw dataset
with st.expander("Lihat Dataset"):
    st.dataframe(filtered_df.head(20))

st.markdown("---")

st.caption(
    "SiDoku Business Analytics Dashboard | "
    "Capstone Project Data Science Dicoding"
)